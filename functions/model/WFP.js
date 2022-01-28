const mongoose = require("mongoose");

const wfpSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  password: { type: String },
});

mongoose.model("Wfp", wfpSchema);
