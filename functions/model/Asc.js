const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ascSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  level: { type: Number, required: true },
  file: { type: String },
  rainFall: { type: String },
  tankWater: { type: String },
  password: {
    type: String,
    required: true,
  },
  sheetList: {
    type: Array,
    default: [],
  },
  decoded: {
    type: String,
  },
});

ascSchema.pre("save", function (next) {
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

ascSchema.methods.comparePassword = function (cPass) {
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

mongoose.model("Asc", ascSchema);
