const express = require("express");

// for routing:
const router = express.Router();

// Importing model:
const User = require("../models/user");

// some other dependencies updated for this route:
const ExpressError = require("../utilities/ExpressError");
const asyncCatcher = require("../utilities/asyncCatcher");

router.get("/register", (req, res) => {
  // show the register page:
  res.render("users/register");
});

router.post("/register", (req, res) => {
  // just for debugging:
  res.send(req.body);

  // const { username, password, email } = req.body;
});

module.exports = router;
