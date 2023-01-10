const express = require("express");

// for routing:
const router = express.Router();

// Importing controller (which contains the business logic):
const campgroundControl = require("../controllers/campground");

// some other dependencies updated for this route:

// importing the required authMiddleware for protecting/validating campground routes:
const {
  isloggedIn,
  schemaValidatorJoi,
  isAuthor
} = require("../authMiddleware");

// for catching async errors:
const asyncCatcher = require("../utilities/asyncCatcher");

// ==================

// All routes :

// async get request for displaying all campgrounds:
router.get("/", asyncCatcher(campgroundControl.indexCampground));

router.get("/new", isloggedIn, campgroundControl.newCampgroundPage);

// show details of individual campground using campground id:

router.get("/:id", asyncCatcher(campgroundControl.showCampgroundPage));

// go to edit page of a campground:
router.get(
  "/:id/edit",
  isloggedIn, // need to login to edit campground,
  isAuthor, // check if user is authorized
  asyncCatcher(campgroundControl.editCampgroundPage)
);

// create new campground:

router.post(
  "/",
  isloggedIn, // need to login to create new campground
  schemaValidatorJoi, // does the server side data validations before running the post route
  asyncCatcher(campgroundControl.createCampground)
);

// edit campground details into db:
router.put(
  "/:id/edit",
  isloggedIn, // need to login to edit campground
  isAuthor, // check if user is authorized
  schemaValidatorJoi, // does the server side data validations before running the put route
  asyncCatcher(campgroundControl.modifyCampground)
);

router.delete(
  "/:id",
  isloggedIn, // need to login to delete campground
  isAuthor, // check if user is authorized
  asyncCatcher(campgroundControl.deleteCampground)
);

module.exports = router;
