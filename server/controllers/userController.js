"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
exports.router = (0, express_1.Router)();
exports.router.get('/', function (req, res) {
    var user = req.body.user;
    res.status(200).json(user);
});
