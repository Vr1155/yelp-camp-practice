const express = require("express");
const app = express();

const User = require("./models/users");

// setting up ejs and relative paths for views:
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// routes:

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secret", (req, res) => {
  res.send("This is a secret route!");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
