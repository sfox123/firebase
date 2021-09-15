const express = require("express");
const router = express.Router();
const fs = require("fs");
const mongoose = require("mongoose");
const ASC = mongoose.model("Asc");
const Advisory = mongoose.model("Advisory");
const path = require("path");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const admin = require("firebase-admin");

const keyFile = "drive.json";

const scopes = ["https://www.googleapis.com/auth/drive"];

const oauth2Client = new GoogleAuth({
  keyFile: keyFile,
  scopes: scopes,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

router.get("/getWeather/:id", (req, res) => {
  const id = req.params.id;
  var starCountRef = admin.database().ref(`agromet/${id}/links`);
  starCountRef.on("value", (snapshot) => {
    const data = snapshot.val();
    res.send(data);
  });
});

router.post("/getFile", async (req, res) => {
  try {
    const { file, size, asc } = req.body;
    var matches = file.match(/^data:.+\/(.+);base64,(.*)$/);
    var ext = matches[1];
    var base64_data = matches[2];
    const filePath = path.resolve(__dirname.replace("routes", "file.docx"));
    var buffer = new Buffer.alloc(size, base64_data, "base64");
    fs.writeFile(filePath, buffer, (err) => {
      // res.send("Success");
      console.log(err);
    });
    const user = await ASC.findById(asc);
    const { archive, email } = user;
    const date = new Date();
    const response = await drive.files.create({
      requestBody: {
        name: `${email}_Advisory_${date.toLocaleDateString()}.docx`,
        mimeType: "application/vnd.google-apps.document",
        parents: [archive],
      },
      media: {
        mimeType: "application/vnd.google-apps.document",
        body: fs.createReadStream(filePath),
      },
    });
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const content = await new Advisory({
      link: `https://docs.google.com/document/d/${response.data.id}`,
      name: `${email}_Advisory_${date.toLocaleDateString()}.docx`,
      asc: asc,
    });
    await content.save();
    res.send("Success").status(200);
  } catch (error) {
    console.error(error);
  }
});

router.get("/dum", (req, res) => {
  const filePath = path.resolve(__dirname.replace("routes", "file.docx"));
  // const base = __filename;
  console.log(filePath);
});

router.get("/getAdvisory", async (req, res) => {
  try {
    const info = await Advisory.find();
    res.send(info).status(200);
  } catch (error) {
    res.send(error).status(422);
  }
});

module.exports = router;
