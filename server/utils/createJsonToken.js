"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
var jwt = require("jsonwebtoken");
var key = "fjdakf1i312313";
function createToken(data) {
    return jwt.sign(data, key);
}
exports.createToken = createToken;
function verifyToken(token) {
    return jwt.verify(token, key);
}
exports.verifyToken = verifyToken;
