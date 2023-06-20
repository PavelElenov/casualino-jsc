const express = require("express");
const expressConfig = require("./config/express");
const routesConfig = require("./config/routes");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const { addMessage } = require("./services/chatService");
const io = new Server(server);

expressConfig(app);
routesConfig(app);

io.on('connection', socket => {
    console.log('New User');
    socket.on('message', data => {
        addMessage(data.creator, data.text, data.conversation);
        socket.broadcast.emit('message', data);
    })
})

server.listen(3000, () => console.log("Server listening on port 3000"));