"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToRequest = exports.addCorsHeaders = void 0;
const createJsonToken_1 = require("../utils/createJsonToken");
const addCorsHeaders = () => (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
};
exports.addCorsHeaders = addCorsHeaders;
const addUserToRequest = () => (req, res, next) => {
    if (req.headers.authorization) {
        const user = (0, createJsonToken_1.verifyToken)(req.headers.authorization);
        req.body['user'] = user;
    }
    next();
};
exports.addUserToRequest = addUserToRequest;
