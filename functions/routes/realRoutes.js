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

const client_id =
  "812288491953-orae0m8b5qovgb0h1uiviv5c42l8buql.apps.googleusercontent.com";
const client_secret = "Ji2K_CJC2uGbYiy5GsdRa0vx";
const refresh_token =
  "1//04Mx_tOWkGa70CgYIARAAGAQSNwF-L9IrUBPXo8ugbXY-vUuPxStjdBIV9sS3tEN4-5b28QxTBc3fVn3qXMIoa8Gsdia2l3S8FRY";
const redirect_uris = "https://developers.google.com/oauthplayground";

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris
);

oauth2Client.setCredentials({ refresh_token: refresh_token });

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
    var buffer = new Buffer.alloc(size, base64_data, "base64");
    fs.writeFileSync("file" + `.${"docx"}`, buffer, function (err) {
      res.send("success");
    });
    const user = await ASC.findById(asc);
    const { archive, email } = user;
    const date = new Date();
    const filePath = path.resolve(__dirname.replace("routes", "file.docx"));
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
