const express = require("express");

const app = express();
const shelterRoutes = require("./routes/shelters/shelters");
const dogRoutes = require("./routes/dogs/dogs");

// using our routers with a particular prefix path for each different routes!
// using "/shelters" for shelter routes and "/dogs" for dogs route!
app.use("/shelters", shelterRoutes);
app.use("/dogs", dogRoutes);

app.get("/", (req, res) => {
  res.send("welcome to home page!!!!");
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
