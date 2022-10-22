const mongoose = require("mongoose");
const Campground = require("./models/campground");

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

const seedDB = async () => {
  await Campground.deleteMany({});
  const c = new Campground({ title: "purple field" });
  await c.save();
};
