"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressConfig = void 0;
const express_1 = __importDefault(require("express"));
const corsMiddleware_1 = require("../middlewares/corsMiddleware");
const expressConfig = (app) => {
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    app.use((0, corsMiddleware_1.addCorsHeaders)());
};
exports.expressConfig = expressConfig;
