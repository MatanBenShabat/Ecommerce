const express = require("express");
const SignInValidation = require("../middlewares/validation/signInValidation");
const SignUpValidation = require("../middlewares/validation/signUpValidation");
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .post("/signup", 
  SignUpValidation, 
  authController.signup)
  .post("/login", 
  SignInValidation, 
  authController.login)
  .post("/startApp", authController.protect, authController.startApp)
  .post("/logout", authController.protect, authController.logout)
  .post("/forgotPassword", authController.forgotPassword)
  .patch("/resetPassword/:token", authController.resetPassword)
  .patch(
    "/updateMyPassword",
    authController.protect,
    authController.updatePassword
  );

router
  .patch("/updateMe", authController.protect, usersController.upadateMe)
  .delete("/deleteMe", authController.protect, usersController.deleteMe)

  .get("/users", usersController.getUsers) //Development
  .delete(
    "/users/?:id",
    authController.restrictTo("admin"),
    usersController.deleteUser
  );

module.exports = router;
