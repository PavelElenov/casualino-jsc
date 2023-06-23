import { io } from "socket.io-client";
import { IMessageInfo } from "../interfaces/conversation";

// const socket = io("http://localhost:3000", {
//   transports: ["websocket"],
// });
console.log('Hi');

// socket.on("message", (data: IMessageInfo) => {
//   console.log(data);
// });
const form = document.getElementById('login-form') as HTMLFormElement;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  console.log('Hiiii');
})

