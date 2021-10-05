const express = require("express");
const router = express();
const mongoose = require("mongoose");
const ASC = mongoose.model("Asc");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

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

//Sheet Auth

router.get("/getGraph", async (req, res) => {
  try {
    const auth = new GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const sheetID = "1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0";
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId: sheetID,
      range: "Daily Rainfall",
    });
    const Arr = getRows.data.values;
    Arr.splice(0, 4);
    res.send(Arr);
  } catch (error) {
    console.error(error);
  }
});

router.get("/apiCall", (req, res) => {
  const asc = ASC.find()
    .then((response) => res.send(response))
    .catch((err) => res.send(err));
});

router.delete("/apiCall/:admin", async (req, res) => {
  const { admin } = req.params;

  const adminAsc = await ASC.findOne({ email: admin });

  await drive.files
    .delete({
      fileId: adminAsc.file,
    })
    .then((response) => res.send("Deleted File"))
    .catch((err) => console.error(err));

  await ASC.findOneAndRemove({ email: admin })
    .then((resp) => console.log("Success"))
    .catch((err) => console.error(err));
});

router.post("/apiCall/:admin/:pass", async (req, res) => {
  const { admin, pass } = req.params;
  const toMail = admin + "-agro";

  const userAC = new ASC({
    email: toMail,
    password: pass,
    decoded: pass,
    level: 2,
    sheetList: [],
  });
  await userAC.save();

  //Drive

  await drive.files.create(
    {
      requestBody: {
        name: admin + "_ASC",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    },
    async (err, file) => {
      if (err) {
        console.error(err);
      } else {
        userAC.file = file.data.id;
        userAC.save();
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            emailAddress: "agrometadvisorylk@gmail.com",
            role: "writer",
            type: "user",
          },
        });
        drive.files.create(
          {
            requestBody: {
              name: "Tank_Water",
              role: "reader",
              type: "anyone",
              parents: [file.data.id],
              mimeType: "application/vnd.google-apps.spreadsheet",
            },
          },
          (err, tank) => {
            if (err) {
              console.error(err);
            } else {
              userAC.tankWater = tank.data.id;
              userAC.save();
              drive.files.create(
                {
                  requestBody: {
                    name: "Rainfall",
                    parents: [file.data.id],
                    mimeType: "application/vnd.google-apps.spreadsheet",
                  },
                },
                (err, rain) => {
                  if (err) {
                    console.error(err);
                  } else {
                    userAC.rainFall = rain.data.id;
                    userAC.save();
                    drive.files.create(
                      {
                        requestBody: {
                          name: "Agromet_Advisory_Archive",
                          parents: [file.data.id],
                          mimeType: "application/vnd.google-apps.folder",
                        },
                      },
                      async (err, finale) => {
                        if (err) {
                          console.error(err);
                          res.send(err).status(422);
                        } else {
                          userAC.archive = finale.data.id;
                          userAC.save();
                          res.send("Success").status(200);
                          await drive.permissions.create({
                            fileId: file.data.id,
                            requestBody: {
                              role: "writer",
                              type: "anyone",
                            },
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

module.exports = router;

//sheets
