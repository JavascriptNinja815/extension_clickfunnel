﻿function Settings(callBack) {

    var _root = this;

    _root.settings = {
        googleSheetId: "",
        sheet1Name: "Sheet1",
        sheet2Name: "Sheet2",
        clickfunnelsTabId: 0,
        maxCsvLinkWaitTime: 60 * 2 * 1000, 
        lastCompletedTime: new Date().toUTCString(),
        checkDelayMins: 60,
        allData: false,
        isActive: true
    };

    // Load
    _root.load = function (callBack) {

        chrome.storage.local.get("settings", function (result) {

            if (result && result.settings) {

                _root.settings.googleSheetId = result.settings.googleSheetId || "";
                _root.settings.sheet1Name = result.settings.sheet1Name || "Sheet1";
                _root.settings.sheet2Name = result.settings.sheet2Name || "Sheet2";
                _root.settings.clickfunnelsTabId = result.settings.clickfunnelsTabId || 0;
                _root.settings.maxCsvLinkWaitTime = result.settings.maxCsvLinkWaitTime || (60 * 2 * 1000); // 2mins.
                _root.settings.lastCompletedTime = result.settings.lastCompletedTime || new Date().toUTCString();
                _root.settings.checkDelayMins = result.settings.checkDelayMins || 60;
                _root.settings.isActive = result.settings.hasOwnProperty("isActive") ? result.settings.isActive : true;
                _root.settings.allData = result.settings.hasOwnProperty("allData") ? result.settings.allData : false;
            }

            if (callBack) callBack(result.settings);
        });
    };
    _root.load(callBack); // auto-load

    // Save
    _root.save = function (callBack) {
        chrome.storage.local.set({ 'settings': _root.settings }, callBack);
    };

}