const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

// importing models
const Campground = require("./models/campground");
const Review = require("./models/review");

// importing routes:
const campgroundRoutes = require("./routes/campground");

// importing other dependencies:
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

const reviewSchmemaValidator = (req, res, next) => {
  const { error } = reviewSchemaJoi.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(",");
    next(new ExpressError(msg));
  } else {
    next();
  }
};

// Importing all Routes Here:

// "/campgrounds" routes:
app.use("/campgrounds", campgroundRoutes);

// ALL GET REQUESTS:

app.get("/", (req, res) => {
  res.render("home");
});

// All POST requests:

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

// All DELETE requests:

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
