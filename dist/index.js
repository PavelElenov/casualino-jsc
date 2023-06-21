"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_2 = require("./config/express");
const routes_1 = require("./config/routes");
const chatService_1 = require("./services/chatService");
const createJsonToken_1 = require("./utils/createJsonToken");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
(0, express_2.expressConfig)(app);
(0, routes_1.routesConfig)(app);
io.on('connection', socket => {
    console.log('New User');
    socket.on('message', (data) => {
        const user = (0, createJsonToken_1.verifyToken)(data.token);
        if (user) {
            (0, chatService_1.addMessage)(user.username, data.text, data.conversation);
            socket.broadcast.emit('message', { text: data.text, conversation: data.conversation, writer: user.username });
        }
    });
});
server.listen(3000, () => console.log("Server listening on port 3000"));
