﻿//// <reference path="MessageHelper.js" />
//// <reference path="Settings.js" />
var _db = new Settings(function () { $(document).ready(INIT); });

var _tabId = 0;
_MessageHelper.toBackground.getTabId(function (tabId) { _tabId = tabId; });

function INIT() {

  if (isActiveTab()) start();
}

function isActiveTab() {
  return _db.settings.clickfunnelsTabId == _tabId && _db.settings.googleSheetId.length > 15 && _db.settings.sheet1Name.length > 0 && _db.settings.sheet2Name.length > 0;
}

function start() {

  if (document.location.href.indexOf("https://app.clickfunnels.com/users/sign_in") > -1) {
    alert("Please login to ClickFunnels");
    console.warn("Please login to ClickFunnels")
    clearInterval(_timer);
    _MessageHelper.toBackground.closeTab(_tabId);
  }
  else {
    // Click Download
    $("a.export-link[data-popup-title='Download CSV']")[0].click();

    // reset download button wait time
    _totalWaitTime = 0;

    // Wait Csv Link from popup
    waitAndGetCsvLink(function (csvLink) {
      if (csvLink) {
        // Download Csv and get Commissions
        getCommissions(csvLink, function (commissionsArray) {

          if (commissionsArray) {

            // Get GoogleSheet Token
            _MessageHelper.toBackground.getAuthToken(function (token) {
              console.log('called token');
              if (token) {
                console.log('token exist');
                // Get Commissions from GoogleSheet (sheet1)
                _MessageHelper.toBackground.readGoogleSheet(_db.settings.googleSheetId, _db.settings.sheet1Name, token, function (commissionsReadResponse) {

                  if (commissionsReadResponse) {

                    var uniqueCommissions = distinctArrays(true, commissionsArray, commissionsReadResponse.values || [], [1, 8]);

                    // Append commisions to GoogleSheet
                    _MessageHelper.toBackground.appendToGoogleSheet(_db.settings.googleSheetId, _db.settings.sheet1Name, token, uniqueCommissions, function (commissionsAppendResponse) {


                      if (commissionsAppendResponse) {

                        // Get Affiliates from GoogleSheet (sheet2)
                        _MessageHelper.toBackground.readGoogleSheet(_db.settings.googleSheetId, _db.settings.sheet2Name, token, function (affiliatesReadResponse) {

                          if (affiliatesReadResponse) {

                            // Get Affiliates from ClickFunnels (sheet2)
                            getAllReferredAffiliates([], "https://app.clickfunnels.com/login_as_cf_affiliate", function (affiliates) {

                              if (affiliates) {

                                var unuqieAffiliates = distinctArrays(false, affiliates, affiliatesReadResponse.values || [], [1, 2]);

                                // Append Affiliates to GoogleSheet
                                _MessageHelper.toBackground.appendToGoogleSheet(_db.settings.googleSheetId, _db.settings.sheet2Name, token, unuqieAffiliates, function (affiliatesAppendResponse) {

                                  if (affiliatesAppendResponse) {

                                    console.log("COMPLETED");

                                    // Save
                                    _db.settings.lastCompletedTime = new Date().toUTCString();
                                    _db.save();

                                    // Close Tab
                                    _MessageHelper.toBackground.closeTab(_db.settings.clickfunnelsTabId);

                                  } else showError("Couldn't append Affiliates to GoogleSheet");

                                });

                              } else showError("Couldn't get Affiliates from ClickFunnels");

                            });

                          } else showError("Couldn't get Affiliates from GoogleSheet");

                        });

                      } else showError("Couldn't append Commissions to GoogleSheet");

                    });

                  } else showError("Couldn't get Commissions from GoogleSheet");

                });

              } else showError("Couldn't get GoogleSheet token");

            });


          } else showError("Couldn't parse the CSV file");

        });

      }


    });
  }
}

function showError(msg) {
  //NP
  console.warn(msg);
  alert(msg);
}
var _timer;
var _waitTime = 2000;
var _totalWaitTime = 0;

function waitAndGetCsvLink(callBack) {

  _timer = setInterval(function () {

    _totalWaitTime += _waitTime;

    var link = $(".download-link a").attr("href");

    if (link !== "#") {
      clearInterval(_timer);
      callBack(link);
    } else if (_totalWaitTime >= _db.settings.maxCsvLinkWaitTime) {
      callBack(false);
    }

  }, _waitTime);
}

function getCommissions(csvUrl, callBack) {

  _MessageHelper.toBackground.ajaxGet(csvUrl, function (result) {

    if (result.isSuccess) {

      var csv = $.csv.toArrays(result.response);
      callBack(csv);

    } else callBack(false);

  });
}

function getAllReferredAffiliates(affs, url, callBack) {

  affs = affs || [];

  _MessageHelper.toBackground.ajaxGet(url, function (result) {

    if (result.isSuccess) {

      var html = result.response;

      var parsedResult = parseReferredAffiliates(html);

      affs = affs.concat(parsedResult.affiliates);

      if (!parsedResult.nextPageUrl) {
        callBack(affs);
      }
      else {
        getAllReferredAffiliates(affs, parsedResult.nextPageUrl, callBack);
      }
    } else {
      console.log("Please login to ClickFunnels!");
    }

  });
}

function parseReferredAffiliates(html) {

  html = html.replace(/src/g, "src2");

  html = $(html);

  var affRows = html.find("#referred_affiliates table.AffiliateTable tbody tr");
  var nextPage = html.find("#referred_affiliates .pagination li.next_page a");

  var data = {
    affiliates: [],
    nextPageUrl: nextPage.length > 0 ? "https://app.clickfunnels.com/" + nextPage.attr("href") : false
  }

  for (var i = 0; i < affRows.length; i++) {

    var affTds = $(affRows[i]).find("td");

    if (affTds.eq(1).text().trim().length > 0) {

      data.affiliates.push([
        affTds.eq(0).text().trim(),
        affTds.eq(1).text().trim(),
        affTds.eq(2).text().trim(),
        affTds.eq(3).text().trim(),
      ]);
    }
  }

  return data;
}//np add blank chenck
function isBlankMatch(cfData, gsData) {

  if (cfData.length == 0 && gsData.length == 1 && gsData == "-") {
    return true;
  }
  else {
    return false;
  }


}
//Array1 is data from web
//Array2 is spreadsheet
function distinctArrays(isComishCheck, array1, array2, checkColumnsArray) {

  var unuqieArray = [];

  //Loop through the web data
  for (var i = 0; i < array1.length; i++) {

    var cf = array1[i];

    var matched = false;
    var matchedColumnCount = 0;

    //np add code her
    // If the comission check and only the request is to get all data
    console.warn("ALL SETINGS")
    console.warn(_db.settings.allData == true)
    if (isComishCheck && _db.settings.allData) {
      //Loop through spreadsheet
      checkColumnsArray = [1, 2, 3, 4, 5, 6, 7, 8];

      for (var x = 0; x < array2.length; x++) {
        //Load spreadsheet row
        var gs = array2[x];
        var matchedColumnCount = 0;
        //              showError("data "+cf[5] +"||")
        //              showError(cf[5]==null);
        //              showError(cf[5].length);
        //              showError("data1 "+gs[5] +"||")
        //              showError(gs[5]==null);
        //              showError(gs[5].length);
        //              if(cf[5].length==0 && gs[5].length==1 && gs[5]=="-")
        //              {showError("Bark")}

        for (var y = 0; y < checkColumnsArray.length; y++) {
          //Check for matches
          //for (var y = 0; y < 1; y++) {
          //showError("data "+cf[checkColumnsArray[y]] +"||" + gs[checkColumnsArray[y]] +"||"+checkColumnsArray.length)
          if (cf[checkColumnsArray[y]] == gs[checkColumnsArray[y]] || isBlankMatch(cf[checkColumnsArray[y]], gs[checkColumnsArray[y]])) {

            matchedColumnCount++;
            //showError("data matched "+matchedColumnCount +"||" + gs[checkColumnsArray[y]]);
            //    matched = true;
          }
        }
        //Check all columns to see if it is new

        matched = matchedColumnCount >= checkColumnsArray.length;
        //  showError("data3 "+matchedColumnCount +" --" + checkColumnsArray.length +" --" +matched.valueOf())
        if (matched) break;
      }
    }

    //Np -- If just a normal check
    else {
      for (var x = 0; x < array2.length; x++) {

        var gs = array2[x];
        var matchedColumnCount = 0;

        //for (var y = 0; y < checkColumnsArray.length; y++) {
        for (var y = 0; y < 1; y++) {
          if (cf[checkColumnsArray[y]] == gs[checkColumnsArray[y]]) {
            matchedColumnCount++;
            matched = true;
          }
        }

        if (matched) break;
      }
    }

    if (!matched) unuqieArray.push(cf);
  }

  return unuqieArray;
}