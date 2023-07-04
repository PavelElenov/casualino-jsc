"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimeInMinutes = void 0;
var getCurrentTimeInMinutes = function () {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return hours * 60 + minutes;
};
exports.getCurrentTimeInMinutes = getCurrentTimeInMinutes;
