"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var socket_io_1 = require("socket.io");
var http = require("http");
var express_1 = require("./config/express");
var routes_1 = require("./config/routes");
var chatService_1 = require("./services/chatService");
var createJsonToken_1 = require("./utils/createJsonToken");
var tokenService_1 = require("./services/tokenService");
var app = express();
var server = http.createServer(app);
var io = new socket_io_1.Server(server);
(0, express_1.expressConfig)(app);
(0, routes_1.routesConfig)(app);
io.use(function (socket, next) {
    if (socket.handshake.query.token) {
        var token = socket.handshake.query.token;
        try {
            var parsedToken = (0, createJsonToken_1.verifyToken)(token);
            (0, tokenService_1.compareToken)({ user: parsedToken.username, token: token });
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
    socket.on("message", function (data, callback) {
        try {
            var message = (0, chatService_1.addMessage)(data);
            io.sockets.emit("message", {
                writer: message.writer,
                message: message,
                time: message.time,
                conversationId: data.conversationId,
            });
            callback({
                message: message,
                status: "ok",
            });
        }
        catch (err) {
            callback({
                status: err.message
            });
        }
    });
    socket.on("disconnect", function () {
        socket.disconnect();
    });
});
server.listen(3000, function () { return console.log("Server listening on port 3000"); });
