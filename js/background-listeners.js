// ********************************************************************************************************************************************************
//                                                                  LISTENERS
// ********************************************************************************************************************************************************

chrome.runtime.onMessage.addListener(function (request, sender, response) {

  var action = request.hasOwnProperty("action") && request.action ? request.action : false;

  // Background
  if (action && request.to == "background") {

    if (action == "Ajax") {
      Ajax(request.url, request.data, request.isPost, response);
    }

    else if (action == "getAuthToken") {
      getAuthToken(response);
    }

    else if (action == "refreshAccessToken") {
      refreshAccessToken(request.token);
    }

    else if (action == "appendToGoogleSheet") {
      appendToGoogleSheet(request.spreadsheetId, request.sheetName, request.token, request.valuesArray, response);
    }

    else if (action == "readGoogleSheet") {
      readGoogleSheet(request.spreadsheetId, request.sheetName, request.token, response);
    }

    else if (action == "opentab") {
      chrome.tabs.create({ url: request.url, active: request.active }, response);
    }

    else if (action == "getTabId") {
      response(sender.tab.id);
    }

    else if (action == "closeTab") {
      chrome.tabs.remove(request.tabId);
    }

    else if (action == "checkClickFunnels") {
      checkClickFunnels(request.id, request.url, request.sheetId);
    }
  }

  return true;
});

// ********************************************************************************************************************************************************
//                                                                  LISTENER - FUNCTIONS
// ********************************************************************************************************************************************************

// Ajax
function Ajax(url, data, isPost, callBack) {

  var options = {};
  options.url = url;
  options.method = isPost ? "POST" : "GET";
  if (isPost && !data) options.data = data;

  options.success = function (response) {

    var result = {

      isSuccess: true,
      errorMessage: "",
      successMessage: "",
      response: response
    };

    if (callBack) callBack(result);
  };

  options.error = function (response) {

    var result = {

      isSuccess: false,
      errorMessage: response && response.hasOwnProperty("responseText") ? response.responseText : "",
      successMessage: "",
      response: response
    };

    if (callBack) callBack(result);
  };

  $.ajax(options);
}


// getAuthToken
function getAuthToken(callBack) {

  // getAuthToken
  chrome.identity.getAuthToken({ 'interactive': true }, function (token) {

    if (!token && chrome.runtime.lastError) {

      // Re-Call - Bug Fix on local requests
      if (chrome.runtime.lastError.message == "Authorization page could not be loaded.") {
        console.log(chrome.runtime.lastError);
        getAuthToken();
      }

      // Error
      else {
        console.log(chrome.runtime.lastError);
      }
    } else callBack(token);
  });

}

// Remove cached token and get new
function refreshAccessToken(token) {

  if (token) {

    chrome.identity.removeCachedAuthToken({ token: token });

    chrome.tabs.getSelected(null, function (tab) {
      getAuthToken(function (token) {
        console.log(token);
      });
    });

  }
}

// APPEND to GOOGLE SHEET
function appendToGoogleSheet(spreadsheetId, sheetName, token, rowsArray, callBack) {

  // fill empty cells with -
  for (var i = 0; i < rowsArray.length; i++) {
    for (var x = 0; x < rowsArray[i].length; x++) {
      rowsArray[i][x] = rowsArray[i][x].length == 0 ? "-" : rowsArray[i][x];
    }
  }

  var data = { values: rowsArray };
  var colRange = sheetName + "";
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + colRange + ":append?valueInputOption=RAW&access_token=" + token;

  googleSheetsAjax(url, data, true, callBack);
}

function readGoogleSheet(spreadsheetId, sheetName, token, callBack) {

  var colRange = sheetName + "!A1:Z50000";
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + colRange + "?access_token=" + token;

  googleSheetsAjax(url, false, false, callBack);
}

function googleSheetsAjax(url, data, isPost, callBack) {

  var options = {

    type: isPost ? "POST" : "GET",
    url: url,

    // [ SUCCESS ]
    success: callBack,

    // [ ERROR ]
    error: function (ex) {

      // Invalid or expired Token
      if (ex.status == 401) {
        alert("Invalid Access Token. Please try again.");

        // refresh token
        refreshAccessToken(token);
      }

      // Invalid Google Sheet Id
      else if (ex.status == 404) {
        alert("Invalid Google Sheet ID");
        callBack(false);
      }

      // Other
      else {
        var err = JSON.parse(ex.responseText);
        alert(err.error.message);
        callBack(false);
      }
    }
  };

  if (isPost) {
    options.data = JSON.stringify(data);
    options.contentType = "application/json; charset=utf-8";
    options.dataType = "json";
  }

  $.ajax(options);
}

// checkClickFunnels
function checkClickFunnels(id, url, sheetId) {
  chrome.tabs.create({ url: url, active: false }, function (tab) {
    _db.settings.clickfunnel[id].url = url;
    _db.settings.clickfunnel[id].sheetId = sheetId;
    _db.settings.clickfunnel[id].tabId = tab.id;
    _db.save();
  });
}