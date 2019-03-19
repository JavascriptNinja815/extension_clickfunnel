// <reference path="MessageHelper.js" />
// <reference path="Settings.js" />
var _db = new Settings(function () { $(document).ready(INIT); });

function INIT() {

  setOptions();
  $("#save").on("click", saveOptions);
  $(".sheetUrl").on("blur", function (event) {
    var active_element = $(event.target);
    var url = $(active_element).val().trim();

    if (url.indexOf("https://docs.google.com/spreadsheets/") > -1) {

      var resourceUrl = $(active_element).val();
      var spreadsheetId = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(resourceUrl)[1];

      if (url.length > 0 && spreadsheetId.length < 15) {
        alert("Invalid Google Sheet URL");
      } else $(active_element).val(spreadsheetId);
    }

  });
  // click first check button
  $("#checkNowFirst").on("click", function () {
    // saveOptions();
    var url = $("#firstUrl").val();
    var sheetId = $("#firstSheet").val();
    _MessageHelper.toBackground.checkClickFunnels('first', url, sheetId);
  });
  // click second check button
  $("#checkNowSecond").on("click", function () {
    // saveOptions();
    var url = $("#secondUrl").val();
    var sheetId = $("#secondSheet").val();
    _MessageHelper.toBackground.checkClickFunnels('second', url, sheetId);
  });
};

// SET input values
function setOptions() {

  $("#firstUrl").val(_db.settings.clickfunnel['first'].url);
  $("#firstSheet").val(_db.settings.clickfunnel['first'].sheetId);

  $("#secondUrl").val(_db.settings.clickfunnel['second'].url);
  $("#secondSheet").val(_db.settings.clickfunnel['second'].sheetId);

  $("#chkIsActive").prop("checked", _db.settings.isActive);
  $("#txtCheckDelayMins").val(_db.settings.checkDelayMins);
  $("#txtLastCompletedTime").text(_db.settings.lastCompletedTime);
  //np 20180619
  $("#txtGoogleSheetAllData").prop("checked", _db.settings.allData);
}

// SAVE input values
function saveOptions() {
  _db.settings.clickfunnel['first'].url = $("#firstUrl").val().trim();
  _db.settings.clickfunnel['first'].sheetId = $("#firstSheet").val().trim();
  _db.settings.clickfunnel['second'].url = $("#secondUrl").val().trim();
  _db.settings.clickfunnel['second'].sheetId = $("#secondSheet").val().trim();

  _db.settings.isActive = $("#chkIsActive").is(":checked");

  _db.settings.checkDelayMins = parseInt($("#txtCheckDelayMins").val());
  //np 20180619
  _db.settings.allData = $("#txtGoogleSheetAllData").is(":checked");

  _db.save(function () {
    $("#status").text("Options saved.").fadeIn("fast").delay(1000).fadeOut('slow');
  });
}