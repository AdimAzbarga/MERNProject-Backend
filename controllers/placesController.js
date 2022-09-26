const httpError = require("../models/httpError");
const { validationResult } = require("express-validator");

const getCoordForAddress = require("../util/location");
const Place = require("../models/places");
const User = require("../models/users");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new httpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new httpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId).populate("places"); // access to places property
  } catch (err) {
    const error = new httpError(
      "Fetching places failed , please try again .",
      500
    );
    return next(error);
  }

  if (!user || user.places.length === 0) {
    const error = new httpError(
      "Could not find places for the provided user id",
      404
    );
    return next(error);
  }
  res.json({
    places: user.places.toObject({ getters: true }),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new httpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title, // title : title
    description,
    address,
    image: req.file.path,
    creatorId: creator,
    location: coordinates,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new httpError(
      "Creating place failed , please try again.",
      500
    );
  }

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new httpError("creating place failed .", 500);
    return next(error);
  }

  if (!user) {
    const error = new httpError(
      "could not find user for provided id , try again .",
      404
    );
    return next(error);
  }

  //pushing places in userPlaces
  try {
    const sess = await mongoose.startSession(); // start a session
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new httpError(
      "creating place failed ,. please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new httpError("Invalid inputs passed, please check your data.", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new httpError("Somthing went wrong , try again later", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;
  console.log(place);

  try {
    await place.save();
  } catch (err) {
    const error = new httpError("Somthing went wrong , try again later", 500);
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) }); // convert mongoose objects to a normal javascript object (_id => id)
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creatorId"); //access to creaorId proprety
    // populate refer a createorId property where i want to change(should ref connection exist between two database models )
  } catch (err) {
    const error = new httpError("Somthing went wrong , try again later", 500);
    return next(error);
  }

  if (!place) {
    const error = new httpError("Could not find a place for provided id.", 404);
    return next(error);
  }

  // make a transaction to remove places from 'places' property and places frm Place model.
  try {
    const sess = await mongoose.startSession(); //start the sesstion
    sess.startTransaction(); // start transaction
    await place.remove({ session: sess }); // remove the place
    await place.creatorId.places.pull(place); // remove the place from places array
    await place.creatorId.save({ session: sess }); // save the user
    await sess.commitTransaction(); // end transaction
  } catch (err) {
    const error = new httpError(" deleting place failed , try again.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
