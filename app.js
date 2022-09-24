const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");
const placesRoutes = require("./routes/placesRoutes.js");
const usersRoutes = require("./routes/usersRoutes");
const httpError = require("./models/httpError");
const { clearScreenDown } = require("readline");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, Origin, X-Requested-With "
  );

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new httpError("Could not find this route", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSend) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || " An unknown error accurred." });
});

mongoose
  .connect(
    "mongodb+srv://adimazbarga:AdimAzbarga12@cluster0.jydbi.mongodb.net/Locashare?retryWrites=true&w=majority"
  )
  .then(() =>
    app.listen(5000, () => {
      console.log("Server started on port 5000");
    })
  )
  .catch((err) => console.log(err));
