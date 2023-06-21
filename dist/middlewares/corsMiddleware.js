"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToRequest = exports.addCorsHeaders = void 0;
const addCorsHeaders = () => (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
};
exports.addCorsHeaders = addCorsHeaders;
const addUserToRequest = () => (req, res, next) => {
    console.log(req.body);
    next();
};
exports.addUserToRequest = addUserToRequest;
