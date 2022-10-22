// importing our seed dataset and helpers:

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// Now importing mongoose and schema and setting up database connections:

const mongoose = require("mongoose");
// note that we are in seeds directory, so use ".."
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// To handle errors after initial connection was established,
// you should listen for error events on the connection
// here we are listening to error events on connection:
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// this function contains the basic seed logic:

// const seedDB = async () => {
//   // delete everything that was there before:
//   await Campground.deleteMany({});
//   // create our new seed, for now just one 1 new instance:
//   const c = new Campground({ title: "purple field" });
//   // save it into our database:
//   await c.save();
// };

const seedDB = async () => {
  // delete everything that was there before:
  await Campground.deleteMany({});

  const randomElemFromArr = Arr => Arr[Math.floor(Math.random() * Arr.length)];

  // create our new seed using our dataset (we will make 50 such insertions):

  for (let i = 0; i < 50; i++) {
    // Math.random() returns any real num in interval [0,1).
    const random1000 = Math.floor(Math.random() * 1000);
    // picking a random city and state and generating a random title:
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${randomElemFromArr(descriptors)} ${randomElemFromArr(places)}`
    });

    await camp.save();
  }

  const c = new Campground({ title: "purple field" });
  // save it into our database:
  await c.save();
};

seedDB().then(() => {
  mongoose.connection.close();
});
