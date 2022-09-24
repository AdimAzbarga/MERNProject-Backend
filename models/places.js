const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, //ref =>make a relation between User and Place models
});

module.exports = mongoose.model("Place", placesSchema);
