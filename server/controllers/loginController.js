"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var userService_1 = require("../services/userService");
var createJsonToken_1 = require("../utils/createJsonToken");
exports.router = (0, express_1.Router)();
exports.router.post("/", function (req, res) {
    try {
        var user = (0, userService_1.login)(req.body.email, req.body.password);
        var token = (0, createJsonToken_1.createToken)(user);
        res.status(200);
        res.json({ user: user, token: token });
    }
    catch (error) {
        res.status(400);
        res.json(error.message);
    }
});
