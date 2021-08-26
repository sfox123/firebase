const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const editorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  decoded: {
    type: String,
  },
  asc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ASC",
  },
  sheetName: {
    type: String,
  },
  sheetID: {
    type: String,
  },
  station: {
    type: String,
  },
  cell: {
    type: String,
  },
});

editorSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

editorSchema.methods.comparePassword = function (cPass) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(cPass, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

mongoose.model("Editor", editorSchema);
