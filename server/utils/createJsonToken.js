"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var key = "fjdakf1i312313";
function createToken(data) {
    return jsonwebtoken_1.default.sign(data, key);
}
exports.createToken = createToken;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, key);
}
exports.verifyToken = verifyToken;
