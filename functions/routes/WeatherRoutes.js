const express = require("express");
const mongoose = require("mongoose");
const Weather = mongoose.model("Weather");
const router = express.Router();
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = (jQuery = require("jquery")(window));

router.get("/weatherAPI", async (req, res) => {
  $(document).ready(function () {
    function test(str, callback) {
      $.ajax({
        url: "https://us-central1-express-439e0.cloudfunctions.net/app/apiCall",
        type: "GET",
        dataType: "JSON",
        success: function (data) {
          callback(data.values);
        },
      });
    }
    test("str", function (url) {
      var crtyear = new Date().getFullYear();
      var arr = [];
      var count = url.reduce((x, y) => Math.max(x, y.length), 0);
      var sum = Array.from(Array(count - 1), () => new Array(12));

      for (var n = 0; n < count - 1; n++) {
        for (var j = 1; j < url.length; j++) {
          for (var w = 0; w < 12; w++) {
            if (w % 2 == 0) {
              arr = [];
              for (var i = j; i < j + 31; i++) {
                if (url[i][n + 1] != null && url[i][n + 1] != "") {
                  arr.push(url[i][n + 1]);
                }
              }
              sum[n][w] = arr.reduce(function (q, b) {
                var val = parseFloat(q) + parseFloat(b);
                return Math.round(val * 10) / 10;
              }, 0);
              j += 31;
            } else if (w % 2 == 1 && w != 1) {
              arr = [];
              for (var i = j; i < j + 30; i++) {
                if (url[i][n + 1] != null && url[i][n + 1] != "") {
                  arr.push(url[i][n + 1]);
                }
              }
              sum[n][w] = arr.reduce(function (q, b) {
                var val = parseFloat(q) + parseFloat(b);
                return Math.round(val * 10) / 10;
              }, 0);
              j += 30;
            } else if (w == 1) {
              if (crtyear % 4 == 0) {
                arr = [];
                for (var i = j; i < j + 29; i++) {
                  if (url[i][n + 1] != null && url[i][n + 1] != "") {
                    arr.push(url[i][n + 1]);
                  }
                }
                sum[n][w] = arr.reduce(function (q, b) {
                  var val = parseFloat(q) + parseFloat(b);
                  return Math.round(val * 10) / 10;
                }, 0);
                j += 29;
              } else {
                arr = [];
                for (var i = j; i < j + 28; i++) {
                  if (url[i][n + 1] != null && url[i][n + 1] != "") {
                    arr.push(url[i][n + 1]);
                  }
                }
                sum[n][w] = arr.reduce(function (q, b) {
                  var val = parseFloat(q) + parseFloat(b);
                  return Math.round(val * 10) / 10;
                }, 0);
                j += 28;
              }
            }
          }
        }
      }
      res.send(sum);
    });
  });
});

module.exports = router;
