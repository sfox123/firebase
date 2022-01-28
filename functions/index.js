require("./model/User");
require("./model/Asc");
require("./model/Advisory");
require("./model/Editor");
require("./model/WFP");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const auth = require("./routes/authRoutes");
const real = require("./routes/realRoutes");
const wfp = require("./routes/wfp");
const editor = require("./routes/editor");
const viewer = require("./routes/Viewer");
const Weather = require("./model/Weather");
const requireAuth = require("./middleware/requireAuth");
const excelRoute = require("./routes/excelData");
const weatherRoute = require("./routes/WeatherRoutes");
const path = require("path");
const app = express();
app.use(cors({ origin: true }));

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const mongoURi =
  "mongodb+srv://admin:Awsedrf1.@cluster0.ojv71.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
app.use(bodyParser.json());

mongoose.connect(mongoURi, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo DB");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});
app.use(express.static(__dirname + "/RP"));

app.use(real);
app.use(auth);
app.use(editor);
app.use(viewer);
app.use(wfp);
app.use(weatherRoute);
app.use(excelRoute);
app.get("/use", (req, res) => {
  res.send("Weather Details On the Way 2.0");
});

app.post("/changeLink", (req, res) => {
  const { link, id, group } = req.body;
  const dataSet = admin.database().ref(`agromet/${group}/links/${id}`);
  dataSet
    .set(link)
    .then((e) => res.send("SENT SUCCESSFULLY"))
    .catch((err) => console.log(err));
});

app.get("/getMongo", (req, res) => {
  Weather.findById("610b8d205f69a510a0efc8f2", (err, data) => {
    res.send(data);
  });
});
app.get("/getMongo/:id", (req, res) => {
  Weather.findById("610b8d205f69a510a0efc8f2", (err, data) => {
    const el = req.params.id.toString();
    res.send(data[el]);
  });
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname + "/RP/index.html"));
});

app.get("/Auth", requireAuth, (req, res) => {
  res.send(`Your email is ${req.user.email}`);
});
app.set("Access-Control-Allow-Origin", "*");
exports.app = functions.https.onRequest(app);
