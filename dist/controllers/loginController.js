"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService_1 = require("../services/userService");
const createJsonToken_1 = require("../utils/createJsonToken");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    try {
        const user = (0, userService_1.login)(req.body.email, req.body.password);
        const token = (0, createJsonToken_1.createToken)(user);
        res.status(200);
        res.json({ user, token });
    }
    catch (error) {
        res.status(400);
        res.json(error.message);
    }
});
module.exports = router;
