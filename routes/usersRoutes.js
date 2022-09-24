const express = require("express");
const usersControllers = require("../controllers/usersController");
const { check } = require("express-validator");

const routes = express.Router();

routes.get(
  "/",

  usersControllers.getUsers
);

routes.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

routes.post("/login", usersControllers.login);

module.exports = routes;
