const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating and exporting review schema with mongoose:

const reviewSchema = new Schema({
  body: String,
  rating: Number
});

// exporting schema:
module.exports = mongoose.model("Review", reviewSchema);
