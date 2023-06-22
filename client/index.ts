import { io } from "socket.io-client";
import { IUser } from "../server/interfaces/user";
import { HttpService } from "./services/httpService";

const httpService = new HttpService();
let conversationName: string;
let token: string;
let user: IUser;

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

socket.on("message", (data) => {
  if (data.conversation === conversationName) {
    console.log(`${data.writer}: ${data.text}`);
  }
});

async function loginUser(email: string, password: string) {
  const res = await httpService.post("/login", { email, password });
  const data = await res.json();

  if (res.status === 200) {
    token = data.token;
    user = data.user;
    askForConversation();
  } else {
    console.log(data);
  }
}

async function getChat() {
  const res = await httpService.get(
    `/conversations/${conversationName}`,
    token
  );
  const data = await res.json();

  if (res.status === 200) {
    const conversationMessages = data.messages;

    if (conversationMessages.length > 0) {
      conversationMessages.map((m) =>
        m.writer === user.username
          ? console.log(`You: ${m.text}`)
          : console.log(`${m.writer}: ${m.text}`)
      );
    }
    readMessages();
  } else {
    console.log(data);
    res.status === 401 ? authenticateUser() : askForConversation();
  }
}

function askForConversation() {
  rl.question(
    "In which conversation you want to join? 1, 2, 3, 4: ",
    (conversation) => {
      conversationName = conversation;
      getChat();
    }
  );
}

function readMessages() {
  socket.emit("message", {
    writer: user.username,
    text: line,
    conversation: conversationName,
    token,
  });
  console.log(`You: ${line}`);
}
