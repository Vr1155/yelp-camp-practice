const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating and exporting campground schema with mongoose:

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String
});

// exporting schema:
module.exports = mongoose.model("Campground", CampgroundSchema);
