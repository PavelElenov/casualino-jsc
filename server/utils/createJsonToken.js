"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
var jwt = require("jsonwebtoken");
var tokenService_1 = require("../services/tokenService");
var key = "fjdakf1i312313";
function createToken(data) {
    var userHaveToken = tokenService_1.tokens.find(function (tokenInfo) { return tokenInfo.user == data.username; });
    return userHaveToken ? userHaveToken.token : jwt.sign(data, key);
}
exports.createToken = createToken;
function verifyToken(token) {
    return jwt.verify(token, key);
}
exports.verifyToken = verifyToken;
