"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const key = "fjdakf1i312313";
function createToken(data) {
    return jsonwebtoken_1.default.sign(data, key);
}
exports.createToken = createToken;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, key);
}
exports.verifyToken = verifyToken;
