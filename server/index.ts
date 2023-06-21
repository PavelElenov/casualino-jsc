import express, { Express } from "express";
import { Server } from "socket.io";
import http from 'http';
import { expressConfig } from "./config/express";
import { routesConfig } from "./config/routes";
import { addMessage } from "./services/chatService";
import { verifyToken } from "./utils/createJsonToken";
import { IJsonWebToken, IUser } from "./interfaces/user";
import { JwtPayload } from "jsonwebtoken";

const app: Express = express();
const server = http.createServer(app);

const io = new Server(server);

expressConfig(app);
routesConfig(app);

io.on('connection', socket => {
    console.log('New User');
    socket.on('message', (data: { writer: string; text: string; conversation: string, token: string }) => {
        const verifiedToken: IJsonWebToken= verifyToken(data.token);
        console.log(verifiedToken.username);

        if (verifiedToken) {
            addMessage(data.writer, data.text, data.conversation);
            socket.broadcast.emit('message', data);
        }
    })
})

server.listen(3000, () => console.log("Server listening on port 3000"));