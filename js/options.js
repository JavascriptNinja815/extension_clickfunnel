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
    saveOptions("first");
    var url = $("#firstUrl").val();
    _MessageHelper.toBackground.checkClickFunnels(url);
  });
  // click second check button
  $("#checkNowSecond").on("click", function () {
    saveOptions("second");
    var url = $("#secondUrl").val();
    _MessageHelper.toBackground.checkClickFunnels(url);
  });
};

// SET input values
function setOptions() {

  $("#firstUrl").val(_db.settings.firstUrl);
  $("#firstSheet").val(_db.settings.firstSheetId);

  $("#secondUrl").val(_db.settings.secondUrl);
  $("#secondSheet").val(_db.settings.secondSheetId);

  $("#chkIsActive").prop("checked", _db.settings.isActive);
  $("#txtCheckDelayMins").val(_db.settings.checkDelayMins);
  $("#txtLastCompletedTime").text(_db.settings.lastCompletedTime);
  //np 20180619
  $("#txtGoogleSheetAllData").prop("checked", _db.settings.allData);
}

// SAVE input values
function saveOptions(id) {
  switch (id) {
    case "first":
      _db.settings.firstUrl = $("#firstUrl").val().trim();
      _db.settings.firstSheetId = $("#firstSheet").val().trim();
      break;
    case "second":
      _db.settings.secondUrl = $("#secondUrl").val().trim();
      _db.settings.secondSheetId = $("#secondSheet").val().trim();
  }
  _db.settings.isActive = $("#chkIsActive").is(":checked");

  _db.settings.checkDelayMins = parseInt($("#txtCheckDelayMins").val());
  //np 20180619
  _db.settings.allData = $("#txtGoogleSheetAllData").is(":checked");

  _db.save(function () {
    $("#status").text("Options saved.").fadeIn("fast").delay(1000).fadeOut('slow');
  });
}