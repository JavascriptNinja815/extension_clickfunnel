/// <reference path="Settings.js" />
var _db = new Settings(INIT);

function INIT() {

    setInterval(function () {

        _db = new Settings(function () {
            if (_db.settings.isActive) openClickFunnels();
        });

    }, _db.settings.checkDelayMins * 60 * 1000);
}

function openClickFunnels() {

    chrome.tabs.create({ url: "https://app.clickfunnels.com/login_as_cf_affiliate", active: false }, function (tab) {

        _db.settings.clickfunnelsTabId = tab.id;
        _db.save();
    });

}

chrome.browserAction.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage();
});