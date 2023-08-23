import * as express from "express";
import { Server } from "socket.io";
import * as http from "http";
import { expressConfig } from "./config/express";
import { routesConfig } from "./config/routes";
import { addMessage } from "./services/chatService";
import { IMessage, IMessageInfo } from "../shared/interfaces/conversation";
import { verifyToken } from "./utils/createJsonToken";
import { compareToken } from "./services/tokenService";
import { IJsonWebToken } from "../shared/interfaces/user";

const app: express.Express = express();
const server = http.createServer(app);

const io = new Server(server);

expressConfig(app);
routesConfig(app);

io.use(function (socket, next) {
  if (socket.handshake.query.token) {
    const token: string | string[] = socket.handshake.query.token;

    try {
      const parsedToken: IJsonWebToken = verifyToken(token as string);
      compareToken({ user: parsedToken.username, token: token as string });
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", function (socket) {
  console.log("New User");

  socket.on("message", (data: IMessageInfo, callback) => {
    try {
      const message: IMessage = addMessage(data);
      io.sockets.emit("message", {
        writer: message.writer,
        message,
        time: message.time,
        conversationId: data.conversationId,
      });
      callback({
        message,
        status: "ok",
      });
    } catch (err: any) {
      callback({
        status: err.message
      })
    }
  });

  socket.on("disconnect", () => {
    socket.disconnect();
  });
});

server.listen(3000, () => console.log("Server listening on port 3000"));
