const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const Campground = require("./models/campground");
const Review = require("./models/review");

const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");

// importing joi schema for server side data validation:
// destructuring so that you can scale by having different schemas!
const { campgroundSchemaJoi, reviewSchemaJoi } = require("./joiSchemas");

const ExpressError = require("./utilities/ExpressError");
const asyncCatcher = require("./utilities/asyncCatcher");

const { nextTick } = require("process");
const review = require("./models/review");

// creating/connecting to a database called yelp-camp:
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// useCreateIndex is no longer necessary in newer versions:
// mongoose.set("useCreateIndex", true);

const db = mongoose.connection;

// To handle errors after initial connection was established,
// you should listen for error events on the connection
// here we are listening to error events on connection:
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

// setting view engine as ejs for SSR:
app.set("view engine", "ejs");
// this allows us to use nodemon app.js from anywhere and still access views.
// basically set path for views relative to this file.
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

// using middlewares here:

// helps in parsing req body which might be in json format:
app.use(
  express.urlencoded({
    extended: true
  })
);
// method override (for http methods other than get and post in html forms)
app.use(methodOverride("_method"));

// using morgan middleware for logging, Using a predefined format string by passing "dev" to morgan.
app.use(morgan("dev"));
// you can also define your own format or build your own middleware (see different branch for middleware).

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

const reviewSchmemaValidator = (req, res, next) => {
  const { error } = reviewSchemaJoi.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(",");
    next(new ExpressError(msg));
  } else {
    next();
  }
};

// ALL GET REQUESTS:

app.get("/", (req, res) => {
  res.render("home");
});

// async get request for displaying all campgrounds:
app.get(
  "/campgrounds",
  asyncCatcher(async (req, res) => {
    // finding all campgrounds will take time so you need await here:
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  const campground = {};
  res.render("campgrounds/new", { campground });
});

// show details of individual campground using campground id:

app.get(
  "/campgrounds/:id",
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

// creates a dummy campground
app.get(
  "/makecampground",
  asyncCatcher(async (req, res) => {
    const camp = new Campground({
      title: "My Backyard",
      description: "Cheap Camping"
    });
    await camp.save();
    res.send(camp);
  })
);

app.get(
  "/campgrounds/:id/edit",
  asyncCatcher(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    res.render("campgrounds/edit", { campground });
  })
);

// All POST requests:

// create new campground:

app.post(
  "/campgrounds",
  schemaValidatorJoi, // does the server side data validations before running the post route
  asyncCatcher(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // note that campground is now in a schema that we want, so we can call save on it:
    await campground.save();
    // now campground is a record in our database, we can access its id, so we can redirect:
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.post(
  "/campgrounds/:id/reviews", // does server side validation for review post route
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
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

// All PUT requests:

app.put(
  "/campgrounds/:id/edit",
  schemaValidatorJoi, // does the server side data validations before running the put route
  asyncCatcher(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// All DELETE requests:

app.delete(
  "/campgrounds/:id",
  asyncCatcher(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  asyncCatcher(async (req, res) => {
    const { id, reviewId } = req.params;

    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    const cammpground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });
    const review = await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`);
  })
);

// 404 handling route:
app.all("*", (req, res, next) => {
  next(new ExpressError("404, page not found!", 404));
});

// Error handling middleware, that will catch errors:
app.use((err, req, res, next) => {
  // displaying the error view along with error msg and stack trace:

  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no! Something went wrong!";

  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
