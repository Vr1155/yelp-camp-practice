const express = require("express");

// for routing:
const router = express.Router({ mergeParams: true });
// we need to set mergeParams as true because express router handles params differently,
// so since we are using this route as "/campgrounds/:id/reviews" and we need id,
// for our joiSchema validation and storage in our db, we will use the option,
// called "mergeParams" to allow use to get params into this route
// from whereever this route was used. (In this case, this route was used in app.js).

// Importing model:
const Campground = require("../models/campground");
const Review = require("../models/review");

// some other dependencies updated for this route:

// importing authMiddleware for protecting new/delete review routes:
const {
  isloggedIn,
  reviewSchmemaValidator,
  isReviewAuthor
} = require("../authMiddleware");

// for catching async errors:
const asyncCatcher = require("../utilities/asyncCatcher");

// All POST requests:

router.post(
  "/", // does server side validation for review post route
  isloggedIn,
  reviewSchmemaValidator,
  asyncCatcher(async (req, res) => {
    // only for debugging
    // res.send(req.body);

    // structure of review object:
    //{"review":{"rating":"2","body":"testing review"}}

    // notice that you have to await findById!
    // console.log(req.params.id);

    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // reviews will have reviewAuthors same way campgrounds have authors:
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Successfully created the review!");

    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

// All DELETE requests:

router.delete(
  "/:reviewId",
  isloggedIn,
  isReviewAuthor,
  asyncCatcher(async (req, res) => {
    const { id, reviewId } = req.params;

    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    const cammpground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });
    const review = await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted the review!");

    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
