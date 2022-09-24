const axios = require("axios");
const httpError = require("../models/httpError");

let API_KEY = "AIzaSyDxNPEsoNn_uHgZ9gjivWR41PEYUqFY8Xg";

async function getCoordsForAddress(address) {
  let response =
    await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}
  `);

  let data = response.data;

  console.log(data);
  if (!data || data.status === "ZERO_RESULTS") {
    let error = new httpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  let coordinates = data.results[0].geometry.location;

  return coordinates;
}
module.exports = getCoordsForAddress;
