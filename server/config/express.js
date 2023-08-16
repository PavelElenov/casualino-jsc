"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressConfig = void 0;
var express = require("express");
var cors = require("cors");
var expressConfig = function (app) {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
};
exports.expressConfig = expressConfig;
