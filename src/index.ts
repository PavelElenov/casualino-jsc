import { io } from "socket.io-client";
import { IMessageInfo } from "../interfaces/conversation";
import { IUser, IUserData } from "./interfaces/user";
import { HttpService } from "./services/httpService";

let user: IUser;
const httpService: HttpService = new HttpService();
const loginPage:HTMLElement = document.querySelector(".login-page") as HTMLElement;
const chatPage:HTMLElement = document.querySelector(".chats-page") as HTMLElement;

const form = document.getElementById("login-form") as HTMLFormElement;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(form));
  console.log(formData);

  await login(formData.email as string, formData.password as string);
});

async function login(email: string, password: string) {
  const res = await httpService.post("/login", { email, password });
  const data = await res.json();

  if (res.status === 200) {
    user = data.user;
    sessionStorage.setItem("auth-token", data.token);

    connectToSocketServer();
    loginPage.style.display = "none";
    chatPage.style.display = 'flex';
  } else {
    const p = document.getElementsByClassName("error")[0] as HTMLElement;
    p.innerText = data;
    const passwordInput:HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    passwordInput.value = "";
  }
}

function connectToSocketServer() {
  const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    query: {
      token: sessionStorage.getItem("auth-token"),
    },
  });

  socket.on("message", (data: IMessageInfo) => {
    console.log(data);
  });
}
