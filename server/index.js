"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var express_2 = require("./config/express");
var routes_1 = require("./config/routes");
var chatService_1 = require("./services/chatService");
var createJsonToken_1 = require("./utils/createJsonToken");
var tokenService_1 = require("./services/tokenService");
var app = (0, express_1)();
var server = http_1.createServer(app);
var io = new socket_io_1.Server(server);
(0, express_2.expressConfig)(app);
(0, routes_1.routesConfig)(app);
io.use(function (socket, next) {
    if (socket.handshake.query.token) {
        var jwtToken = socket.handshake.query.token;
        console.log(jwtToken);
        try {
            var parsedToken = (0, createJsonToken_1.verifyToken)(jwtToken);
            (0, tokenService_1.compareToken)({ user: parsedToken.username, token: jwtToken });
            next();
        }
        catch (err) {
            next(new Error("Authentication error"));
        }
    }
    else {
        next(new Error("Authentication error"));
    }
}).on("connection", function (socket) {
    console.log("New User");
    socket.on("message", function (data) {
        (0, chatService_1.addMessage)(data.writer, data.text, data.conversation);
        socket.broadcast.emit("message", {
            text: data.text,
            conversation: data.conversation,
            writer: data.writer,
        });
    });
});
server.listen(3000, function () { return console.log("Server listening on port 3000"); });