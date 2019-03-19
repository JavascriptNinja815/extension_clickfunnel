function MessageHelper() {

    var _root = this;

    // ********************************************************************************************************************************************************
    //                                                                  SENDERS
    // ********************************************************************************************************************************************************
    _root.toBackground = {

        ajaxGet: function (url, callBack) {
            chrome.runtime.sendMessage({ to: "background", action: "Ajax", url: url, data: null, isPost: false }, callBack);
        },

        ajaxPost: function (url, data, callBack) {
            chrome.runtime.sendMessage({ to: "background", action: "Ajax", url: url, data: data, isPost: true }, callBack);
        },

        getAuthToken: function (callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'getAuthToken' }, callBack);
        },

        refreshAccessToken: function (token, callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'refreshAccessToken', token: token }, callBack);
        },

        appendToGoogleSheet: function (spreadsheetId, sheetName, token, valuesArray, callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'appendToGoogleSheet', spreadsheetId: spreadsheetId, sheetName: sheetName, token: token, valuesArray: valuesArray }, callBack);
        },

        readGoogleSheet: function (spreadsheetId, sheetName, token, callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'readGoogleSheet', spreadsheetId: spreadsheetId, sheetName: sheetName, token: token }, callBack);
        },

        // Returns tab
        openTab: function (url, active, callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'opentab', url: url, active: active }, callBack);
        },

        getTabId: function (callBack) {
            chrome.runtime.sendMessage({ to: 'background', action: 'getTabId' }, callBack);
        },

        closeTab: function (tabId) {
            chrome.runtime.sendMessage({ to: 'background', action: 'closeTab', tabId: tabId });
        },

        checkClickFunnels: function (id, url, sheetId) {
            chrome.runtime.sendMessage({ to: 'background', action: 'checkClickFunnels', id: id, url:url, sheetId: sheetId});
        }

    }
}

var _MessageHelper = new MessageHelper();