const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cors = require("cors");
const Editor = mongoose.model("Editor");
const Asc = mongoose.model("Asc");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const e = require("express");

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

router.get("/editorFetch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Editor.findById(id)
      .then((resp) => res.send(resp))
      .catch((err) => res.send(err));
  } catch (error) {}
});

router.get("/getEditor/:id", async (req, res) => {
  const { id } = req.params;
  const user = await Asc.findById(id);
  res.send(user);
});

router.delete("/editor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Editor.findByIdAndRemove(id)
      .then((editor) => res.send("Success"))
      .catch((err) => console.error(err));
  } catch (error) {
    res.send(error).status(422);
  }
});

router.post("/editorCall", async (req, res) => {
  try {
    const { email, asc, station, sheetName, password, tankWater, rainFall } =
      req.body;
    let rainFallId = "";
    let tankWaterId = "";
    const decoded = password;
    const admin = await Asc.findById(asc);
    const Email = email.toLowerCase();
    if (rainFall) {
      rainFallId = admin["rainFall"];
    }

    if (tankWater) {
      tankWaterId = admin["tankWater"];
    }

    const editor = await new Editor({
      ["email"]: Email,
      password,
      asc,
      sheetName,
      station,
      decoded,
      ["rainFall"]: [rainFall, rainFallId],
      ["tankWater"]: [tankWater, tankWaterId],
    });

    await editor.save();
    res.send("Success").status(200);
  } catch (error) {
    res.status(422).send(error);
    console.log(error);
  }
});

router.post("/editorCall/station", async (req, res) => {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const { stationName, sheet, asc, lat, lon, district } = req.body;

  const AscUser = await Asc.findById(asc);

  const sheetID = AscUser[stationName];
  AscUser["sheetList"].push([stationName, sheet]);
  AscUser["district"].push([district, stationName]);
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
    await googleSheets.spreadsheets.values.append({
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
            "Officer",
          ],
        ],
      },
    });
    // adding excel to master file
    const monthArr = [];
    for (let i = 0; i < 28; i++) {
      if (i === 0) {
        monthArr.push(sheet);
      }
      if (i === 1) {
        monthArr.push(lat);
      }
      if (i === 2) {
        monthArr.push(lon);
      }

      monthArr.push(" ");
    }

    await googleSheets.spreadsheets.values
      .append({
        auth,
        spreadsheetId: `1QzLYOrijo-dZJNh9Qs_jiB1RuruGsljyYYqRXoSQ3ms`,
        range: `2021!A:B`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [monthArr],
        },
      })
      .catch((err) => console.error(err));
  }
});

router.post("/editorCall/Data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const { rainfall, date, editor, sheet, sheetID } = req.body;

    const foundOne = await Editor.findById(editor);
    const { email } = foundOne;
    console.log(id);
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: id,
      range: `${sheet}!A:B`,
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
    console.log(error);
    res.send(error);
  }
});
router.post("/editorCall/DataTank", async (req, res) => {
  try {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const { waterLevel, waterCapacity, date, editor, sheet, sheetID } =
      req.body;

    const foundOne = await Editor.findById(editor);

    const { email, tankWater } = foundOne;

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: sheetID,
      range: `${sheet}!A:B`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            `${new Date().toLocaleString()}`,
            `${date}`,
            `${waterLevel}`,
            `${waterCapacity}`,
            `${email}`,
          ],
        ],
      },
    });

    res.sendStatus(200);
  } catch (error) {
    res.send(error);
  }
});

router.post("/getRecords", async (req, res) => {
  const { id, sheetList } = req.body;
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const Data = { rainfall: [], tankwater: [] };

  try {
    const editor = await Editor.findById(id);
    const { rainFall, tankWater } = editor;
    const { rain, tank } = sheetList;

    if (rainFall[0]) {
      rain.map(async (x, i) => {
        await googleSheets.spreadsheets.values
          .get({
            auth,
            spreadsheetId: rainFall[1],
            range: x,
          })
          .then(({ data }) => {
            Data.rainfall.push({ ...data.values });
          })
          .finally((final) => {
            if (tankWater[0]) {
              tank.map(async (x, i) => {
                await googleSheets.spreadsheets.values
                  .get({
                    auth,
                    spreadsheetId: tankWater[1],
                    range: x,
                  })
                  .then(({ data }) => {
                    Data.tankwater.push({ ...data.values });
                  })
                  .catch((err) => console.error(err))
                  .finally((response) => {
                    res.send(Data);
                  });
              });
            } else {
              res.send(Data);
            }
          })
          .catch((err) => console.error(err));
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/updateStation", async (req, res) => {
  try {
    const tmp = [];
    const { data, user } = req.body;
    const editor = await Editor.findOne({ email: user });
    const { asc } = editor;
    const admin = await Asc.findById(asc);
    const { tankWater, rainFall } = admin;

    const rain = [true, rainFall];
    const tank = [true, tankWater];

    editor["sheetName"] = data;

    data.map((x, i) => {
      const label = x.split("-")[1].trim();
      tmp.push(label);
    });

    if (tmp.includes("rainFall")) {
      editor["rainFall"] = rain;
    } else {
      editor["rainFall"] = [false, ""];
    }

    if (tmp.includes("tankWater")) {
      editor["tankWater"] = tank;
    } else {
      editor["tankWater"] = [false, ""];
    }

    await editor.save();
    res.send("Success");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
