"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var timeService_1 = require("../services/timeService");
exports.router = (0, express_1.Router)();
exports.router.get("/", function (req, res) {
    var time = (0, timeService_1.getCurrentTimeInMinutes)();
    res.status(200).json(time);
});
