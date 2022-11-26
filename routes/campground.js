const express = require("express");

// for routing:
const router = express.Router();

// Importing model:
const Campground = require("../models/campground");

// some other dependencies updated for this route:
const { campgroundSchemaJoi } = require("../joiSchemas");
const ExpressError = require("../utilities/ExpressError");
const asyncCatcher = require("../utilities/asyncCatcher");

// This function will do server side data validation using joi schema:
const schemaValidatorJoi = (req, res, next) => {
  // body contains a json object as a value which had a key of "campground"
  // {"campground":{"title":"camp","location":"location"}}

  // simple error throwing:
  // if "campground" key is not present in the payload, throw an error:
  // if (!req.body.campground)
  //   throw new ExpressError("Invalid/Insufficent data", 400);

  // as you can see this is tedious and quite difficult to scale.
  // But here will use joi schema to make our job easier!

  // validate() checks whether body is matching our Joi schema!
  // result of validate(req.body) will be of following format:
  // {
  //   value: {
  // original res.body
  //          },
  //   error: [Error [ValidationError]: "campground" is required]
  //        {
  //          _original: {},
  //          details: [ [Object] ]
  //        }
  // }

  const { error } = campgroundSchemaJoi.validate(req.body);

  // notice that error.details is an array.

  // if error exists, then throw expressError with all details joined by ",":
  if (error) {
    const msg = error.details.map(err => err.message).join(",");
    next(new ExpressError(msg));
  } else {
    next();
  }
};

// async get request for displaying all campgrounds:
router.get(
  "/",
  asyncCatcher(async (req, res) => {
    // finding all campgrounds will take time so you need await here:
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", (req, res) => {
  const campground = {};
  res.render("campgrounds/new", { campground });
});

// creates a dummy campground with some dummy values [to be deprecated]:
router.get(
  "/makecampground",
  asyncCatcher(async (req, res) => {
    const camp = new Campground({
      title: "My Backyard",
      description: "Cheap Camping",
      image:
        "https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/campground.jpg"
    });
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

// show details of individual campground using campground id:

router.get(
  "/:id",
  asyncCatcher(async (req, res) => {
    // finding campground with that specific id using findById(),
    // it will always return 1 record since ids are unique:
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    // populate with reviews according to their objectid so we can show them on details page!
    // notice that we have to write the name of the key which has value as array of objectids.
    // in this case, "reviews" was the key which had stored the array of objectids which we want to populate with object values!
    res.render("campgrounds/show", { campground });
  })
);

// go to edit page of a campground:
router.get(
  "/:id/edit",
  asyncCatcher(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    res.render("campgrounds/edit", { campground });
  })
);

// create new campground:

router.post(
  "/",
  schemaValidatorJoi, // does the server side data validations before running the post route
  asyncCatcher(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // note that campground is now in a schema that we want, so we can call save on it:
    await campground.save();

    // Show flash message on the screen:
    req.flash("success", "Successfully created a new campground!");

    // now campground is a record in our database, we can access its id, so we can redirect:
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// edit campground details into db:
router.put(
  "/:id/edit",
  schemaValidatorJoi, // does the server side data validations before running the put route
  asyncCatcher(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground
    });

    req.flash("success", "Successfully edited the campground!");

    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  asyncCatcher(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted the campground!");

    res.redirect("/campgrounds");
  })
);

module.exports = router;
