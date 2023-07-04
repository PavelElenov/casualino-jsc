"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCorsHeaders = void 0;
var addCorsHeaders = function () { return function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    console.log("In cors middleware");
    next();
}; };
exports.addCorsHeaders = addCorsHeaders;
