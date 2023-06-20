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
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
(0, express_2.expressConfig)(app);
(0, routes_1.routesConfig)(app);
io.on('connection', socket => {
    console.log('New User');
    socket.on('message', (data) => {
        // addMessage(data.writer, data.text, data.conversation);
        socket.broadcast.emit('message', data);
    });
});
server.listen(3000, () => console.log("Server listening on port 3000"));
