const mongoose = require("mongoose");

const advisorySchema = new mongoose.Schema({
  link: {
    type: String,
  },
  name: {
    type: String,
  },
  asc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ASC",
  },
});

mongoose.model("Advisory", advisorySchema);
