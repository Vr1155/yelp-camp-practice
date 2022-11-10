const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// creating and exporting campground schema with mongoose:

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
  // one to many relationship
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

// "findByIdAndDelete" calls "findOneAndDelete" which supports post middleware!
// we can use this to delete all reviews of a particular camp whenever we delete that camp!

CampgroundSchema.post("findOneAndDelete", async camp => {
  if (camp) {
    // if the camp exists, we delete all its reviews, for that we will use $in operato,
    // The $in operator selects the documents or values,
    // where the value of a field equals any value in the specified array.

    // delete all reviews related to this campground.

    await Review.deleteMany({ _id: { $in: camp.reviews } });
  }
});

// exporting schema:
module.exports = mongoose.model("Campground", CampgroundSchema);
