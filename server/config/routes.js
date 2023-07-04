"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesConfig = void 0;
var loginController_1 = require("../controllers/loginController");
var chatController_1 = require("../controllers/chatController");
var userController_1 = require("../controllers/userController");
var timeController_1 = require("../controllers/timeController");
var checkAuthToken_1 = require("../middlewares/checkAuthToken");
var routesConfig = function (app) {
    app.use("/login", loginController_1.router);
    app.use("/conversations", (0, checkAuthToken_1.checkForAuthToken)(), chatController_1.router);
    app.use("/user", (0, checkAuthToken_1.checkForAuthToken)(), userController_1.router);
    app.use("/time", timeController_1.router);
};
exports.routesConfig = routesConfig;
