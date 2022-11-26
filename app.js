const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

// importing models
const Campground = require("./models/campground");
const Review = require("./models/review");

// importing routes:
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");

// importing other dependencies:
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

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

app.use(express.static(path.join(__dirname, "public")));
// used path.join so that we can access static assets from public folder from anywhere,
// (just like in views).

// Setting up express session Here:

const sessionConfig = {
  // server's secret key that should be stored very securely:
  secret: "thisshouldbeabettersecret",
  // There are only to make deprecation warnings to go away:
  resave: false,
  saveUninitialized: false,
  // cookie configurations:
  cookie: {
    // An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data.
    // It provides a gate that prevents the specialized cookie from being accessed by anything other than the server.
    // As a result, even if a cross-site scripting (XSS) flaw exists, and a user accidentally accesses a link that exploits the flaw, the browser will not reveal the cookie to the third-party.
    // Here’s an example – let’s say a browser detects a cookie containing the HttpOnly flag.  If the client-side code attempts to read the cookie, the browser will return an empty string as a result.  This helps prevent malicious (usually cross-site scripting (XSS)) code from sending the data to an attacker’s website.
    httpOnly: true,

    // This cookie will expire in a week from now:
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

// using sessions with our predefined configs:
app.use(session(sessionConfig));

// Brief intro about flash:
// The flash is a special area of the session used for storing messages.
// Messages are written to the flash and cleared after being displayed to the user.
// The flash is typically used in combination with redirects,
// ensuring that the message is available to the next page that is to be rendered.

// using flash messages:
app.use(flash());

// Middleware for handling flash messages (whereever they are used in the app):
app.use((req, res, next) => {
  // notice that res.locals are available everywhere,
  // whereever res is used (including res.redirect),
  // so whatever was stored in flash("success") by any routes by using req.flash("success"),
  // it will be stored in res.locals.success,
  // with help of this middleware.
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Importing all Routes Here:

// "/campgrounds" routes:
app.use("/campgrounds", campgroundRoutes);
// "/campgrounds/:id/reviews" aka review routes:
app.use("/campgrounds/:id/reviews", reviewRoutes);
// notice how we need id in our review route,
// but express router handles params differently,
// thankfully we can use mergeParams option in our review route so we can still get id,
// from here into our review route.

// ALL GET REQUESTS:

app.get("/", (req, res) => {
  res.render("home");
});

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
