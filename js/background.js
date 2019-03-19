//<reference path="Settings.js" />
var _db = new Settings(INIT);

function INIT() {

  setInterval(function () {

    _db = new Settings(function () {
      if (_db.settings.isActive) {
        openClickFunnels('first', _db.settings.clickfunnel['first'].url, _db.settings.clickfunnel['first'].sheetId);
        openClickFunnels('second', _db.settings.clickfunnel['second'].url, _db.settings.clickfunnel['second'].sheetId);
      }
    });

  }, _db.settings.checkDelayMins * 60 * 1000);
}

function openClickFunnels(id, url, sheetId) {

  chrome.tabs.create({ url: url, active: false }, function (tab) {
    _db.settings.clickfunnel[id].url = url;
    _db.settings.clickfunnel[id].sheetId = sheetId;
    _db.settings.clickfunnel[id].tabId = tab.id;
    _db.save();
  });

}

chrome.browserAction.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});