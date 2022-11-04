const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utilities/ExpressError");
const asyncCatcher = require("./utilities/asyncCatcher");

const { nextTick } = require("process");

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
    const campground = await Campground.findById(req.params.id);
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
  asyncCatcher(async (req, res, next) => {
    // body contains a json object as a value which had a key of "campground"
    // {"campground":{"title":"camp","location":"location"}}

    // if "campground" key is not present in the payload, throw an error:
    if (!req.body.campground)
      throw new ExpressError("Invalid/Insufficent data", 400);

    const campground = new Campground(req.body.campground);
    // note that campground is now in a schema that we want, so we can call save on it:
    await campground.save();
    // now campground is a record in our database, we can access its id, so we can redirect:
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// All PUT requests:

app.put(
  "/campgrounds/:id/edit",
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

// 404 handling route:
app.all("*", (req, res, next) => {
  next(new ExpressError("404, page not found!", 404));
});

// Error handling middleware, that will catch errors:
app.use((err, req, res, next) => {
  const { message = "Something went wrong", statusCode = 500 } = err;
  res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
