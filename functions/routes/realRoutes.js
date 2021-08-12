const express = require("express");
const router = express.Router();

const admin = require("firebase-admin");

router.get("/getWeather/:id", (req, res) => {
  const id = req.params.id;
  var starCountRef = admin.database().ref(`agromet/${id}/links`);
  starCountRef.on("value", (snapshot) => {
    const data = snapshot.val();
    res.send(data);
  });
});

module.exports = router;
