const crypto = require("crypto");
const { promisify } = require("util");

const jwt = require("jsonwebtoken");

const AppError = require("../Utils/appError");
const Users = require("../models/usersModel");
const catchAsync = require("../Utils/catchAsync");
const { validate } = require("../models/usersModel");
const sendEmail = require("../Utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  //Removes password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.startApp = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: { username: req.user.username, userType: req.user.userType },
  });
};

exports.logout = (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", null, cookieOptions);
  res.status(204).json({
    status: "success",
    message: "logged out successfully",
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await Users.create({
    //Prevents from the user to select role(admin for exam) by himself-we get only what we need WITHOUT the users role
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //2)Check if user exsists && password is correct

  const user = await Users.findOne({ email }).select("+password");
  if (
    !user ||
    !(await user.correctPassword(password.toString(), user.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3)If evertything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check of it's there
  token = req.cookies["jwt"];

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if user still exists
  const currentUser = await Users.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to the token does no longer exists.",
        401
      )
    );
  }
  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfer(decoded.iat)) {
    // console.log("REACHED HERE", decoded.iat);
    return next(
      new AppError(
        "User recently changed his Password/Email/Username. Please login again.",
        401
      )
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTED email

  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  //2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Cancels the validators in the model so we can provide only email withous pass and staff

  //3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api-users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch rquest with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
      resetToken
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired, and there is user, set the new password

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user-in the usersModel

  // 4) Log the user in, send JWT

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await Users.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct

  if (
    !(await user.correctPassword(
      req.body.passwordCurrent.toString(),
      user.password
    ))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) If so, update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // Users.findByIdAndUpdate will NOT work cuz of the pre.save() methods I defined in the usersModel(bcrypt and passwordChangedAt)

  // 4) Log user in, send JWT

  createSendToken(user, 200, res);
});
