const UsersSchema = require("./signInSchema");
const AppError = require("../../Utils/appError");


const SignInValidation = (req, res, next) => {
  const { body } = req;

  const result = UsersSchema.validate(body);

  const { value, error } = result;

  const valid = (error == null);

  if (!valid) {
    return next(new AppError(error.message, 400))
  } else {
    next();
  }
};

module.exports = SignInValidation
