const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  0: {
    0: {
      0: {
        type: String,
        default: "https://www.doa.gov.lk/index.php/si/agro-met-advisory-sin",
      },
      1: {
        type: String,
        default:
          "https://www.doa.gov.lk/images/weather_climate/2021/Agtech19_Tamil.pdf",
      },
    },
    1: {
      0: {
        type: String,
        default:
          "https://docs.google.com/spreadsheets/d/1vglLgviFoxQQwa2Wgq1GhCyupgVtmr12WrGkRcSIZ6w/edit#gid=631447100",
      },
      1: {
        type: String,
        default:
          "https://wfp.sharepoint.com/:x:/s/COSriLanka/Eee_nCfAMqtGnJ38w108f0sBvnyoh73CZVGTSMThaiYXcQ?e=yChd2M",
      },
    },
  },
  1: {
    0: {
      type: String,
      default:
        "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=188&Itemid=546&lang=en",
    },
  },
  3: {
    0: {
      type: String,
      default:
        "https://docs.google.com/spreadsheets/d/1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0/edit#gid=1786238575",
    },
    1: {
      type: String,
      default:
        "https://docs.google.com/spreadsheets/d/1sPRn1djyNIpw20pJIzSCtyYna1mVJIeFf43Rep2UXgM/edit#gid=2101796100",
    },
  },
  2: {
    0: {
      type: String,
      default:
        "https://docs.google.com/spreadsheets/d/1xpm1j5pulQFL4GPeU8LLsp74UeHymHytJEO1olDCzn0/edit#gid=1786238575",
    },
    1: {
      type: String,
      default:
        "https://docs.google.com/spreadsheets/d/1sPRn1djyNIpw20pJIzSCtyYna1mVJIeFf43Rep2UXgM/edit#gid=2101796100",
    },
  },
  4: {
    0: {
      type: String,
      default:
        "https://www.meteoblue.com/en/weather/14-days/aluth-wewa_sri-lanka_1251795",
    },
    1: {
      type: String,
      default:
        "https://www.meteoblue.com/en/weather/14-days/kotaweramankada_sri-lanka_1239072",
    },
    2: {
      type: String,
      default:
        "https://www.meteoblue.com/en/weather/14-days/iyankan-kulam_sri-lanka_1242845",
    },
    3: {
      type: String,
      default:
        "https://www.meteoblue.com/en/weather/14-days/uliyan-kulam_sri-lanka_1225657",
    },
    4: {
      type: String,
      default:
        "https://www.meteoblue.com/en/weather/14-days/puttuvedduvanmanatkulam_sri-lanka_1229281",
    },
  },
  5: { type: String },
  0: {
    0: {
      0: {
        type: String,
        default:
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=55:2019-05-10-09-09-34&catid=10&lang=si&Itemid=148",
      },
      1: {
        type: String,
        default:
          "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=1:home-page&catid=11&lang=ta&Itemid=142",
      },
    },
    1: {
      type: String,
      default: "http://www.meteo.gov.lk/images/tenday/202103290000_nmc2.pdf",
    },
    2: {
      type: String,
      default:
        "http://www.meteo.gov.lk/index.php?option=com_content&view=article&id=78&Itemid=290&lang=en",
    },
  },
});

module.exports = mongoose.model("Weather", weatherSchema);
