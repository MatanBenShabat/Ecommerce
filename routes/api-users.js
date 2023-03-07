const express = require("express");
const SignInValidation = require("../middlewares/validation/signInValidation");
const SignUpValidation = require("../middlewares/validation/signUpValidation");
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .post("/signup", SignUpValidation, authController.signup)
  .post("/login", SignInValidation, authController.login)
  .post("/forgotPassword", authController.forgotPassword)
  .patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router
  .post("/startApp", authController.startApp)

  .post("/logout", authController.logout)

  .patch(
    "/updateMyPassword",

    authController.updatePassword
  )

  .patch(
    "/updateMe",
    usersController.uploadImage,
    usersController.resizeUserImage,
    usersController.updateMe
  )
  .patch("/updateRole", usersController.updateRole)
  .delete("/deleteMe", usersController.deleteMe)

  .get("/users", authController.restrictTo("admin"), usersController.getUsers) //Development
  .delete(
    "/users/?:id",
    authController.restrictTo("admin"),
    usersController.deleteUser
  );

module.exports = router;
