const express = require("express");

// for routing:
const router = express.Router();

// Importing model:
const User = require("../models/user");

// some other dependencies updated for this route:
const asyncCatcher = require("../utilities/asyncCatcher");
const passport = require("passport");

// Register routes:

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

// Login routes:

router.get("/login", (req, res) => {
  // show the login page:
  res.render("users/login");
});

// passport has authenticate() which can act as a middleware,

// Notice that, authenticate() automatically parses the request body for username and pasword.
// and it checks whether the username and hash of that password exits in db or not.
// All of this is done automatically by passport.
// This is because we had the following lines in app.js:
// 1. passport.use(new localStrategy(User.authenticate()));
// 2. passport.serializeUser(User.serializeUser());
// 3. passport.deserializeUser(User.deserializeUser());

// All of this helps make work of authentication easier and hides internal details,
// of how authentication was implemented.

// we need to specify auth strategy ("local" in this case).
// we can also specify whether to redirect or display flash messages in case of wrong creds.

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  (req, res) => {
    req.flash("success", "Login Successful! Welcome back!");
    res.redirect("/campgrounds");
  }
);

module.exports = router;
