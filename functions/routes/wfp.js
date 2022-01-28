const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = mongoose.model("Wfp");

router.post("/wfp/login", async (req, res) => {
  const { userName, passWord } = req.body.userData;
  try {
    if (!userName || !passWord) {
      return res.status(422).send({ error: "Must Provide a Password" });
    }
    const user = await User.findOne({ name: userName });
    console.log(user);
    if (user.password === passWord) {
      res.send(user);
    } else {
      res.status(422).send({ error: "Invalid Password" });
    }
  } catch (error) {
    res.send(error).status(500);
  }
});

module.exports = router;
