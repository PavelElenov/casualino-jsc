"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToken = void 0;
function parseToken(req, res, next) {
    console.log(req.body);
    // const user = verifyToken(req.body.token);
    next();
}
exports.parseToken = parseToken;
