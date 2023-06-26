import { io } from "socket.io-client";
import { IConversation, IMessageInfo } from "../interfaces/conversation";
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

async function login(email: string, password: string): Promise<void> {
  const res = await httpService.post("/login", { email, password });
  const data:any = await res.json();

  if (res.status === 200) {
    user = data.user;
    sessionStorage.setItem("auth-token", data.token);

    connectToSocketServer();

    loginPage.style.display = "none";
    chatPage.style.display = 'flex';

    getAllChats();
  } else {
    const p = document.getElementsByClassName("error")[0] as HTMLElement;
    p.innerText = data;
    const passwordInput:HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    passwordInput.value = "";
  }
}

function connectToSocketServer(): void {
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

async function getAllChats(): Promise<void>{
  const res = await httpService.get("/conversations", sessionStorage.getItem('auth-token')!);
  const chats:IConversation[] = await res.json();


}

function getCurrentTimeInMinutes(): number{
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

function getHowLongAgoMessageWasWritten(messageTime: number, currentTime: number): string{
  const difference = currentTime - messageTime;

  if(difference < 1){
    return "less than a minute ago"
  }else if(difference < 60){
    return `${difference} minutes ago`
  }else{
    return `${difference % 60} hours ago`
  }
}
