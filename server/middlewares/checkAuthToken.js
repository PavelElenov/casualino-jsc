"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForAuthToken = void 0;
var createJsonToken_1 = require("../utils/createJsonToken");
var checkForAuthToken = function () { return function (req, res, next) {
    if (req.headers.authorization) {
        var user = (0, createJsonToken_1.verifyToken)(req.headers.authorization);
        req.body["user"] = user;
        next();
    }
    else {
        res.status(401).json("User is not authenticate");
    }
}; };
exports.checkForAuthToken = checkForAuthToken;
