import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import { expressConfig } from "./config/express";
import { routesConfig } from "./config/routes";
import { addMessage } from "./services/chatService";
import { IMessageInfo } from "../interfaces/conversation";

const app: Express = express();
const server = http.createServer(app);

const io = new Server(server);

expressConfig(app);
routesConfig(app);

io.on("connection", (socket) => {
  console.log("New User");
  socket.on(
    "message",
    (data: IMessageInfo) => {
      addMessage(data.writer, data.text, data.conversation);
      socket.broadcast.emit("message", {
        text: data.text,
        conversation: data.conversation,
        writer: data.writer,
      });
    }
  );
});

server.listen(3000, () => console.log("Server listening on port 3000"));
