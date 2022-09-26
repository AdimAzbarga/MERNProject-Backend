const httpError = require("../models/httpError");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const users = require("../models/users");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new httpError(
      "Fetching users failed , try again later .",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new httpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { name, email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError("Sighnign up failed , try again later.", 500);
    return next(error);
  }
  if (user) {
    const error = new httpError(
      "User already exists , try login instead.",
      422
    );
    return next(error);
  }

  let hashedPass;

  try {
    hashedPass = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = httpError("Registering failed, please try again.", 500);
    return next(error);
  }

  const registeredUser = new User({
    name,
    email,
    places: [],
    password: hashedPass,
    image: req.file.path,
  });

  try {
    await registeredUser.save();
  } catch (err) {
    const error = new httpError(
      "Somthing went wrong , please try again later.",
      500
    );
  }

  res.status(201).json({ user: registeredUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError("logging in failed , try again later.", 500);
    return next(error);
  }

  if (!user) {
    const error = new httpError(
      "invalid credentials , could not log you in",
      501
    );
    return next(error);
  }

  let isValidPass = false;
  try {
    isValidPass = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new httpError(
      "Logining in failed , please try again later",
      500
    );
    return next(error);
  }

  if (!isValidPass) {
    const error = new httpError(
      "invalid credentials , could not log you in",
      501
    );
    return next(error);
  }

  res.json({
    message: "Logged in",
    user: user.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
