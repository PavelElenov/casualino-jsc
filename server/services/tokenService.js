"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToken = exports.compareToken = exports.tokens = void 0;
exports.tokens = [];
function compareToken(data) {
    var userData = exports.tokens.find(function (t) { return t.user == data.user; });
    if ((userData === null || userData === void 0 ? void 0 : userData.token) == data.token) {
        return true;
    }
    else {
        throw new Error();
    }
}
exports.compareToken = compareToken;
function addToken(data) {
    exports.tokens.push(data);
}
exports.addToken = addToken;
