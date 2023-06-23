import { io } from "socket.io-client";
import { IMessageInfo } from "../interfaces/conversation";
import { HttpService } from "./services/httpService";

const httpService = new HttpService();


const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

socket.on("message", (data: IMessageInfo) => {
  console.log(data);
});

