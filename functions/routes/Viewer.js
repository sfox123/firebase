const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const Asc = mongoose.model("Asc");

const client_id =
  "812288491953-orae0m8b5qovgb0h1uiviv5c42l8buql.apps.googleusercontent.com";
const client_secret = "Ji2K_CJC2uGbYiy5GsdRa0vx";
const refresh_token =
  "1//04hHXFuWrrlQVCgYIARAAGAQSNwF-L9IrbgHKhMaaskeITkmSmsmDzMLGJ4H93asYBxE8DmVxEtzS3uHWPv_bS3elTuNIv-cPgkc";
const redirect_uris = "https://developers.google.com/oauthplayground";

const auth = new GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

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

router.get("/getMaster", async (req, res) => {
  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    await drive.files.create(
      {
        requestBody: {
          name: "Master File",
          role: "reader",
          type: "anyone",
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
      },
      async (err, master) => {
        await drive.permissions.create({
          fileId: master.data.id,
          requestBody: {
            emailAddress:
              "agromet@consummate-fold-313803.iam.gserviceaccount.com",
            role: "writer",
            type: "user",
          },
        });
        await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId: master.data.id,
          range: "Sheet1!A:B",
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [
              ["Date (entered)", "Date (measured)", "RainFall(mm)", "Officer"],
            ],
          },
        });
      }
    );
    res.send("SUCCESS");
  } catch (error) {
    res.send(err).status(422);
    console.log(error);
  }
});

module.exports = router;
