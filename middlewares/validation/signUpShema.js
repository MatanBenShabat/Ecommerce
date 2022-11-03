const Joi = require("joi");

const SignUpSchema = Joi.object({
  username: Joi.string().alphanum().empty().required().messages({
    "any.required": "Please provide username",
    "string.empty": "Cannot be empty",
  }),
  email: Joi.string().email().empty().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide valid email",
    "string.empty": "Cannot be empty",
  }),
  password: Joi.string()
    .empty()
    .min(8)
    .max(15)
    .alphanum()
    .required("Please provide password")
    .messages({
      "any.required": "Password is required",
      "string.empty": "PasswordConfirm cannot be an empty field",
      "any.only": "Passwords must match",
      "string.min": "Should be equal or longer than 8 charachters",
      "string.max": "Should be equal or shorter than 15 charachters",
    }),
  passwordConfirm: Joi.string().valid(Joi.ref("password")),
});
module.exports = SignUpSchema;
