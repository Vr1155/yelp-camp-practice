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

// We can use router.route() to group all different types of routes to a specific endpoint:

router
  .route("/")
  // async get request for displaying all campgrounds:
  .get(asyncCatcher(campgroundControl.indexCampground))
  // create new campground:
  .post(
    isloggedIn, // need to login to create new campground
    schemaValidatorJoi, // does the server side data validations before running the post route
    asyncCatcher(campgroundControl.createCampground)
  );

// notice why this route has to be placed before "/:id".
// so that "new" is not considered as id.
router.get("/new", isloggedIn, campgroundControl.newCampgroundPage);

router
  .route("/:id")
  // show details of individual campground using campground id:
  .get(asyncCatcher(campgroundControl.showCampgroundPage))
  .delete(
    isloggedIn, // need to login to delete campground
    isAuthor, // check if user is authorized
    asyncCatcher(campgroundControl.deleteCampground)
  );

router
  .route("/:id/edit")
  // go to edit page of a campground:
  .get(
    isloggedIn, // need to login to edit campground,
    isAuthor, // check if user is authorized
    asyncCatcher(campgroundControl.editCampgroundPage)
  )
  // edit campground details into db:
  .put(
    isloggedIn, // need to login to edit campground
    isAuthor, // check if user is authorized
    schemaValidatorJoi, // does the server side data validations before running the put route
    asyncCatcher(campgroundControl.modifyCampground)
  );

module.exports = router;
