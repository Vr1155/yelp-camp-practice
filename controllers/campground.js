// Importing model:
const Campground = require("../models/campground");

module.exports.indexCampground = async (req, res) => {
  // finding all campgrounds will take time so you need await here:
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.newCampgroundPage = (req, res) => {
  const campground = {};
  res.render("campgrounds/new", { campground });
};

module.exports.showCampgroundPage = async (req, res) => {
  // finding campground with that specific id using findById(),
  // it will always return 1 record since ids are unique.
  // Notice that reviews and author are stored as reference in Campground model,
  // so we need to populate them by getting the author data from User model into Campground model where it was referenced.
  // Also we need to populate Review model with its own review authors (which were stored as User obj ids),
  // this is done with nested populate as shown below,
  // which populates reviews with review authors:
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } }) // nested populate
    .populate("author");

  // now review and author data is in Campground.
  // console.log(campground);

  // if campground is not found, flash error and go to index:
  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    res.redirect("/campgrounds");
  }

  // populate with reviews according to their objectid so we can show them on details page!
  // notice that we have to write the name of the key which has value as array of objectids.
  // in this case, "reviews" was the key which had stored the array of objectids which we want to populate with object values!
  res.render("campgrounds/show", { campground });
};

module.exports.editCampgroundPage = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);

  // since we are storing campground authors as ids,
  // user._id is provided by passport,
  // we will set reference to author (which is done with that user's object id):
  campground.author = req.user._id;

  // note that campground is now in a schema that we want, so we can call save on it:
  await campground.save();

  // Show flash message on the screen:
  req.flash("success", "Successfully created a new campground!");

  // now campground is a record in our database, we can access its id, so we can redirect:
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.modifyCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground
  });

  req.flash("success", "Successfully edited the campground!");

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findByIdAndDelete(id);

  req.flash("success", "Successfully deleted the campground!");

  res.redirect("/campgrounds");
};
