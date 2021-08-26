const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const ASC = mongoose.model("Asc");
const Editor = mongoose.model("Editor");
const router = express.Router();

router.get("/users", async (req, res) => {
  User.find().then((user) => {
    res.send(user);
  });
});

router.post("/signup", async (req, res) => {
  const { email, password, level } = req.body;

  try {
    const user = new User({ email, password, level });
    await user.save();

    const token = jwt.sign({ userId: user._id }, "123");
    res.send({ token });
  } catch (error) {
    return res.status(422).send(error.message);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "Must Provide a Password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    const asc = await ASC.findOne({ email });
    if (!asc) {
      const editor = await Editor.findOne({ email });
      if (!editor) {
        return res.status(500).send({ error: "Email not found" });
      }
      try {
        await editor.comparePassword(password);
        res.send({ editor });
      } catch (error) {
        return res.status(422).send({ error: "Invalid Password or Email" });
      }
    }
    try {
      await asc.comparePassword(password);
      res.send({ asc });
    } catch (error) {
      return res.status(422).send({ error: "Invalid Password or Email" });
    }
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "123");
    res.send({ user });
  } catch (error) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
});

module.exports = router;
