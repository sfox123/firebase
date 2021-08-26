const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cors = require("cors");
const Editor = mongoose.model("Editor");
const Asc = mongoose.model("Asc");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

router.get("/getEditor/All", async (req, res) => {
  try {
    const editor = await Editor.find();
    res.send(editor).status(200);
  } catch (error) {
    res.send(error).status(422);
  }
});

router.get("/getEditor/:id", async (req, res) => {
  const { id } = req.params;
  const user = await Asc.findById(id);
  res.send(user);
});

router.post("/editorCall", async (req, res) => {
  res.send("success");
  const { email, asc, station, sheetName, password } = req.body;
  let sheetID = "";
  const decoded = password;

  await Asc.findById(asc)
    .catch((err) => console.error(err))
    .then((res) => {
      sheetID = res[station];
    });

  try {
    const editor = await new Editor({
      email,
      password,
      asc,
      sheetName,
      sheetID,
      station,
      decoded,
    });
    await editor.save();
    res.send("Success").status(200);
  } catch (error) {
    res.status(422).send(error);
  }
});

router.post("/editorCall/station", async (req, res) => {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const { stationName, sheet, asc, lat, lon } = req.body;

  const AscUser = await Asc.findById(asc);

  const sheetID = AscUser[stationName];
  AscUser["sheetList"].push([stationName, sheet]);
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

  if (stationName == "rainFall") {
    try {
      const request = await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetID,
        requestBody: formData,
      });
      request.then((resp) => res.send(resp));
    } catch (error) {
      res.send(error).status(422);
    }
    await googleSheets.spreadsheets.values
      .append({
        auth,
        spreadsheetId: sheetID,
        range: `${sheet}!A:B`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            ["Station Name", `${sheet}`],
            ["Longitute", `${lon}`],
            ["Latitute", `${lat}`],
            ["", "", ""],
            ["Date (entered)", "Date (measured)", "RainFall(mm)", "Officer"],
          ],
        },
      })
      .catch((err) => console.error(err));
  }

  if (stationName == "tankWater") {
    try {
      const request = await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetID,
        requestBody: formData,
      });
      request.then(async (resp) => res.send(resp));
    } catch (error) {
      res.send(error).status(422);
    }
    await googleSheets.spreadsheets.values
      .append({
        auth,
        spreadsheetId: sheetID,
        range: `${sheet}!A:B`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            ["Station Name", `${sheet}`],
            ["Longitute", `${lon}`],
            ["Latitute", `${lon}`],
            ["", "", ""],
            [
              "Date (entered)",
              "Date (measured)",
              "Water Level(ft)",
              "Capacity (Ac.ft)",
            ],
          ],
        },
      })
      .catch((err) => console.error(err));
  }
});

router.post("/editorCall/Data", async (req, res) => {
  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const { rainfall, date, editor } = req.body;

    const foundOne = await Editor.findById(editor);
    const { sheetName, sheetID, email } = foundOne;

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: sheetID,
      range: `${sheetName}!A:B`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            `${new Date().toLocaleString()}`,
            `${date}`,
            `${rainfall}`,
            `${email}`,
          ],
        ],
      },
    });

    res.sendStatus(200);
  } catch (error) {
    res.send(err);
  }
});

module.exports = router;
