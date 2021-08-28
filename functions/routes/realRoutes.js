const express = require("express");
const router = express.Router();
const fs = require("fs");

const admin = require("firebase-admin");

router.get("/getWeather/:id", (req, res) => {
  const id = req.params.id;
  var starCountRef = admin.database().ref(`agromet/${id}/links`);
  starCountRef.on("value", (snapshot) => {
    const data = snapshot.val();
    res.send(data);
  });
});

router.post("/getFile", async (req, res) => {
  const { file, size } = req.body;
  var matches = file.match(/^data:.+\/(.+);base64,(.*)$/);
  var ext = matches[1];
  var base64_data = matches[2];
  var buffer = new Buffer.alloc(size, base64_data, "base64");

  await fs.writeFile(__dirname + "/RP/img", buffer, function (err) {
    res.send("success");
  });
  // res.send("Success").status(200);
});

module.exports = router;
