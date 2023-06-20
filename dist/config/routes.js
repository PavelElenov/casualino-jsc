"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesConfig = void 0;
const loginController = require("../controllers/loginController");
const usersController = require("../controllers/usersController");
const chatController = require("../controllers/chatController");
const routesConfig = (app) => {
    app.use("/login", loginController);
    app.use("/conversations", chatController);
    app.use("/", usersController);
};
exports.routesConfig = routesConfig;
