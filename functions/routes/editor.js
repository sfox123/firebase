const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Editor = mongoose.model("Editor");
const Asc = mongoose.model("Asc");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

router.get("/getEditor/:id", async (req, res) => {
  const { id } = req.params;
  const user = await Asc.findById(id);
  res.send(user);
});

router.post("/editorCall", async (req, res) => {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const { email, password, asc, station, lat, long } = req.body;

  const decoded = password;

  const AscUser = await Asc.findById(asc);
  const sheetID = AscUser[station];

  try {
    const editor = new Editor({
      email,
      password,
      asc,
      sheetID,
      station,
      decoded,
    });
    await googleSheets.spreadsheets.values
      .append({
        auth,
        spreadsheetId: sheetID,
        range: "Sheet1!A:B",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            ["Date(Entered)", "Date(Measured)", "RainFall(mm)"],
            ["1", "2", "3"],
          ],
        },
      })
      .catch((err) => console.log(err));
    await editor.save();
    res.send(editor).status(200);
  } catch (error) {
    return res.status(422).send(error.message);
  }
});

router.post("/editorCall/station", async (req, res) => {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const { station, sheet, asc } = req.body;

  const AscUser = await Asc.findById(asc);

  const sheetID = AscUser[station];
  AscUser["sheetList"].push([station, sheet]);
  AscUser.save();

  const formData = {
    requests: [
      {
        addSheet: {
          properties: {
            title: sheet,
            gridProperties: {
              rowCount: 20,
              columnCount: 12,
            },
            tabColor: {
              red: 1.0,
              green: 0.3,
              blue: 0.4,
            },
          },
        },
      },
    ],
  };

  try {
    const request = await googleSheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetID,
      requestBody: formData,
    });
    request.then((resp) => res.send(resp.data));
  } catch (error) {
    res.send(error).status(422);
  }
});

module.exports = router;
