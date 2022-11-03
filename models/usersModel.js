const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UsersScheme = mongoose.Schema({
  username: {
    type: String,
    required: [true, "A user must have a username"],
    minlength: 4,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
    //This only works on CREATE and SAVE
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  image: String,
  // active: {
  //   type: Boolean,
  //   default: true,
  //   select: false

  // },

  userType: {
    type: String,
    // required: true,
    enum: ["customer", "seller", "admin"],
    default: "customer",
    // select: false
  },
});

UsersScheme.pre("save", async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field cuz we don't need it in the DB
  this.passwordConfirm = undefined;
  next();
});

UsersScheme.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UsersScheme.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: true } });
  next();
});

UsersScheme.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UsersScheme.methods.changedPasswordAfer = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimesstamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimesstamp;
  }
  // False means NOT changed
  return false;
};

UsersScheme.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Users = mongoose.model("Users", UsersScheme);
module.exports = Users;
