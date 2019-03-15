/// <reference path="MessageHelper.js" />
/// <reference path="Settings.js" />
var _db = new Settings(function () { $(document).ready(INIT); });

function INIT() {

  setOptions();
  $("#save").on("click", saveOptions);
  $("#txtGoogleSheetId").on("blur", function () {

    var url = $("#txtGoogleSheetId").val().trim();

    if (url.indexOf("https://docs.google.com/spreadsheets/") > -1) {

      var resourceUrl = $("#txtGoogleSheetId").val();
      var spreadsheetId = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(resourceUrl)[1];

      if (url.length > 0 && spreadsheetId.length < 15) {
        alert("Invalid Google Sheet URL");
      } else $("#txtGoogleSheetId").val(spreadsheetId);
    }

  });

  $("#checkNow").on("click", function () {
    saveOptions();
    _MessageHelper.toBackground.checkClickFunnels();
  });
};

// SET input values
function setOptions() {

  $("#txtGoogleSheetId").val(_db.settings.googleSheetId);
  $("#chkIsActive").prop("checked", _db.settings.isActive);
  $("#txtCheckDelayMins").val(_db.settings.checkDelayMins);
  $("#txtLastCompletedTime").text(_db.settings.lastCompletedTime);
  //np 20180619
  $("#txtGoogleSheetAllData").prop("checked", _db.settings.allData);
}

// SAVE input values
function saveOptions() {

  // _options
  _db.settings.googleSheetId = $("#txtGoogleSheetId").val().trim();
  _db.settings.isActive = $("#chkIsActive").is(":checked");

  _db.settings.checkDelayMins = parseInt($("#txtCheckDelayMins").val());
  //np 20180619
  _db.settings.allData = $("#txtGoogleSheetAllData").is(":checked");

  _db.save(function () {
    $("#status").text("Options saved.").fadeIn("fast").delay(1000).fadeOut('slow');
  });
}