const express = require("express");
const router = express();
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

router.get("/apiCall", async (req, res) => {
  const auth = new GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });

  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId: "1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0",
  });
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: "1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0",
    range: "Daily Rainfall",
  });
  res.send(getRows.data);
});

module.exports = router;
