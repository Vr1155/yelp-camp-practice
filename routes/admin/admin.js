const express = require("express");
// importing and instantiating router from express module:
const router = express.Router();

// This middleware will only be applied to admin route (all routes in current file!)
router.use((req, res, next) => {
  if (req.query.adminPass === "Admin") {
    next();
  }
  res.send("Sorry! you are not a admin!!!!");
});

router.get("/", (req, res) => {
  res.send("welcome to admin portal!!");
});

router.get("/topsecret", (req, res) => {
  res.send("showing all topsecrets!!");
});

router.get("/delete_everything", (req, res) => {
  res.send("deleting all stuff!!");
});
module.exports = router;
