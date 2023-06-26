"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressConfig = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var expressConfig = function (app) {
    app.use(express_1.urlencoded({ extended: true }));
    app.use(express_1.json());
    app.use((0, cors_1)());
};
exports.expressConfig = expressConfig;
