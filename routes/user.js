const express = require("express");

// for routing:
const router = express.Router();

// Importing controller (which contains the business logic):
const userControl = require("../controllers/user");

// some other dependencies updated for this route:
const asyncCatcher = require("../utilities/asyncCatcher");
const passport = require("passport");

// ===================

// All routes:

// Register routes:

router.get("/register", userControl.showRegister);

router.post("/register", asyncCatcher(userControl.register));

// Login routes:

router.get("/login", userControl.showLogin);

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
    failureRedirect: "/login",
    keepSessionInfo: true
  }),
  userControl.login
);

// !!! IMPORTANT: Important to include "keepSessionInfo:true" as option above,
// since that helps us track the originalUrl,
// which is stored in req.session.returnTo.

// Just to show that passport.js modifies session after successful login,
// Therefore we need to specify option:
// keepSessionInfo: true
// while logging in.

// logout route:
router.get("/logout", userControl.logout);

module.exports = router;
