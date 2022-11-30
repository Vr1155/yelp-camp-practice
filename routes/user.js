const express = require("express");

// for routing:
const router = express.Router();

// Importing model:
const User = require("../models/user");

// some other dependencies updated for this route:
const asyncCatcher = require("../utilities/asyncCatcher");

router.get("/register", (req, res) => {
  // show the register page:
  res.render("users/register");
});

router.post(
  "/register",
  asyncCatcher(async (req, res) => {
    // just for debugging:
    // res.send(req.body);

    try {
      //extract username, password and email:
      const { username, password, email } = req.body;
      // create an obj if they are according to mongoose schema:
      const user = new User({
        email,
        username
      });
      // use static plugin method register() from "passport-local-mongoose" to register user:
      const newUser = await User.register(user, password);
      // display flash msg and redirect to all campgrounds:
      req.flash("success", "Registeration Successful! Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    } catch (e) {
      // if anything fails, display error flash msg and redirect back to register page:
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);

module.exports = router;
