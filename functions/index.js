require("./model/Weather");
require("./model/User");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const auth = require("./routes/authRoutes");
const weather = require("./routes/WeatherRoutes");
const requireAuth = require("./middleware/requireAuth");
const excelRoute = require("./routes/excelData");

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

app.use(auth);
app.use(weather);
app.use(excelRoute);
app.get("/", (req, res) => {
  res.send("Weather Details On the Way");
});

app.get("/getWeather", (req, res) => {
  var starCountRef = admin.database().ref("/");
  starCountRef.on("value", (snapshot) => {
    const data = snapshot.val();
    res.send(data);
  });
});
app.post("/changeLink", (req, res) => {
  const { link, id, group } = req.body;
  const dataSet = admin.database().ref(`agromet/${group}/links/${id}`);
  dataSet
    .set(link)
    .then((e) => res.send("SENT SUCCESSFULLY"))
    .catch((err) => console.log(err));
});
app.post("/postData", (req, res) => {
  const dataSet = admin.database().ref("agromet");
  dataSet
    .set([
      {
        heading: "Agro-Met Advisory",
        subHeadings: ["National Level"],
        linkNames: ["Sinhala Version", "Tamil Version"],
        links: [
          "https://www.doa.gov.lk/index.php/si/agro-met-advisory-sin",
          "https://www.doa.gov.lk/images/weather_climate/2021/Agtech19_Tamil.pdf",
        ],
      },
      {
        heading: "Tank Water Availability",
        subHeadings: ["Local Level"],
        linkNames: ["Thanamalvila", "Thunukai"],
        links: [
          "https://docs.google.com/spreadsheets/d/1vglLgviFoxQQwa2Wgq1GhCyupgVtmr12WrGkRcSIZ6w/edit#gid=631447100",
          "https://wfp.sharepoint.com/:x:/s/COSriLanka/Eee_nCfAMqtGnJ38w108f0sBvnyoh73CZVGTSMThaiYXcQ?e=yChd2M",
        ],
      },
      {
        heading: "Rainfall Analysis",
        subHeadings: ["Local Level"],
        linkNames: ["Monaragala", "Mulaitivu"],
        links: [
          "https://docs.google.com/spreadsheets/d/1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0/edit#gid=1786238575",
          "https://docs.google.com/spreadsheets/d/1sPRn1djyNIpw20pJIzSCtyYna1mVJIeFf43Rep2UXgM/edit#gid=2101796100",
        ],
      },
      {
        heading: "Drought Analysis",
        subHeadings: ["Local Level"],
        linkNames: ["Drought Bulletin 2021"],
        links: [
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=188&Itemid=546&lang=en",
        ],
      },
      {
        heading: "Weather Around Your Location",
        subHeadings: ["Local Level"],
        linkNames: [
          "Alutwewa",
          "Kotaweheramankada",
          "Iyankankulam",
          "Uliyankulam",
          "Puththwedduwan",
        ],
        links: [
          "https://www.meteoblue.com/en/weather/14-days/aluth-wewa_sri-lanka_1251795",
          "https://www.meteoblue.com/en/weather/14-days/kotaweramankada_sri-lanka_1239072",
          "https://www.meteoblue.com/en/weather/14-days/iyankan-kulam_sri-lanka_1242845",
          "https://www.meteoblue.com/en/weather/14-days/uliyan-kulam_sri-lanka_1225657",
          "https://www.meteoblue.com/en/weather/14-days/puttuvedduvanmanatkulam_sri-lanka_1229281",
        ],
      },
      {
        heading: "Weather Forecast",
        subHeadings: ["Local Level"],
        linkNames: [
          "Sinhala Version",
          "Tamil Version",
          "Medium Range PDF",
          "Seasonal Forecast PDF",
        ],
        links: [
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=55:2019-05-10-09-09-34&catid=10&lang=si&Itemid=148",
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=1:home-page&catid=11&lang=ta&Itemid=142",
          "http://www.meteo.gov.lk/images/tenday/202103290000_nmc2.pdf",
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=78&Itemid=290&lang=en",
        ],
      },
    ])
    .then((response) => res.json("SENT SUCCESSFULL"))
    .catch((err) => console.error(err));
});
app.get("/getWeather", (req, res) => {
  var starCountRef = admin.database().ref("agromet");
  starCountRef.on("value", (snapshot) => {
    const data = snapshot.val();
    res.send(data);
  });
});

app.get("/Auth", requireAuth, (req, res) => {
  res.send(`Your email is ${req.user.email}`);
});

exports.app = functions.https.onRequest(app);
