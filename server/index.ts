import express, { Express } from "express";
import { Server } from "socket.io";
import http from 'http';
import { expressConfig } from "./config/express";
import { routesConfig } from "./config/routes";
import { addMessage } from "./services/chatService";
import { verifyToken } from "./utils/createJsonToken";
import { IJsonWebToken } from "./interfaces/user";


const app: Express = express();
const server = http.createServer(app);

const io = new Server(server);

expressConfig(app);
routesConfig(app);

io.on('connection', socket => {
    console.log('New User');
    socket.on('message', (data: { text: string; conversation: string, token: string }) => {
        const user: IJsonWebToken = verifyToken(data.token);

        if (user) {
            addMessage(user.username, data.text, data.conversation);
            socket.broadcast.emit('message', { text: data.text, conversation: data.conversation, writer: user.username });
        }
    })
})

server.listen(3000, () => console.log("Server listening on port 3000"));