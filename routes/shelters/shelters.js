const express = require("express");
// importing and instantiating router from express module:
const router = express.Router();

router.get("/", (req, res) => {
  res.send("showing all shelters!!");
});

router.get("/:id", (req, res) => {
  res.send(`showing all shelter with id: ${req.params.id}`);
});

router.post("/", (req, res) => {
  res.send("creating a new shelter!!");
});

router.get("/:id/edit", (req, res) => {
  res.send(`editing a shelter with id: ${req.params.id}`);
});

module.exports = router;
