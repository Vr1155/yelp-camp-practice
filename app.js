const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to homePage!");
});

// cookies are used to store some information on the browser.
// All information in cookies is also sent to server in each request.
// They add some statefulness between requests.

app.get("/setName", (req, res) => {
  res.cookie("Name", "Doctor_wario");
  res.send("Your name has been set in cookies!");
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
