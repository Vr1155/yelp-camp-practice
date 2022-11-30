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

// importing joi schema for server side data validation:
// destructuring so that you can scale by having different schemas!
const { reviewSchemaJoi } = require("../joiSchemas");
const ExpressError = require("../utilities/ExpressError");
// for catching async errors:
const asyncCatcher = require("../utilities/asyncCatcher");

// Joi Schema Validator for review model:
const reviewSchmemaValidator = (req, res, next) => {
  const { error } = reviewSchemaJoi.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(",");
    next(new ExpressError(msg));
  } else {
    next();
  }
};

// All POST requests:

router.post(
  "/", // does server side validation for review post route
  reviewSchmemaValidator,
  asyncCatcher(async (req, res) => {
    // only for debugging
    // res.send(req.body);

    // structure of review object:
    //{"review":{"rating":"2","body":"testing review"}}

    // notice that you have to await findById!

    console.log(req.params.id);
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);

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
