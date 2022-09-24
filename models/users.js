const mongoose = require("mongoose");
const Validators = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

usersSchema.plugin(Validators); //  only create a new user if email doesn't exist &&query email as fast as passible in database with unique

module.exports = mongoose.model("User", usersSchema);
