const Users = require("../models/usersModel");
const AppError = require("../Utils/appError");
const authorize = require("../Utils/authorize");
const catchAsync = require("../Utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await Users.find({});
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.updateRole = catchAsync(async (req, res, next) => {
  const types = (type) => {
    return ["seller", "customer"].includes(type);
  };

  if (!req.body.userType) {
    return next(new AppError("Empty field. Please enter a correct type.", 400));
  }

  if(req.body.userType === req.user.userType){
    return next(new AppError(`You are already ${req.user.userType}! Please pick another role.`, 400));
  }

  if (!types(req.body.userType)) {
    return next(new AppError("Incorrect userType", 400));
  }

  await Users.findOneAndUpdate(
    { email: req.user.email },
    { userType: req.body.userType }
  );
  const user = await Users.findOne({ email: req.user.email }).select("userType username")

  res.status(200).json({
    status: "success",
    data: {
      user:{
        username: user.username,
        userType: user.userType
      }
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSts password data
  if (req.body.password || req.body.paswordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const { name, email, photo } = req.body;
  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // const filteredBody = filterObj(req.body, "username", "email")

  // 3) Upload users document
  const user = Object.assign(
    req.user,
    JSON.parse(JSON.stringify({ name, email, photo }))
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// exports.createUser = (req, res, next) => {
//   if (!req.body) res.json({ error: "invalid input" });

//   Users.create(req.user)
//     .then(() =>
//       res.status(201).json({
//         error: false,
//         message: "user registered successfully",
//       })
//     )
//     .catch((err) => {
//       res.json({
//         error: true,
//         message: "couldn't register user",
//       });
//     });
// };

// exports.login = (req, res, next) => {
//   Users.findOne({ username: req.body.username })

//     .then((user) => {
//       if (!authorize(req, user)) {
//         res.status(401).json({
//           status: "error",
//           message: "password is incorrect",
//         });
//       } else {
//         res.status(200).json({ status: "success", data: { user } });
//       }
//     })
//     .catch(next);
// };

exports.deleteUser = (req, res, next) => {
  Users.findOneAndDelete({ _id: req.params.id })
    .then((data) => res.json(data))
    .catch(next);
};
