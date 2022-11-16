const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to homePage!");
});

app.get("/setName", (req, res) => {
  res.cookie("Name", "Doctor_wario");
  res.send("Your name has been set in cookies!");
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
