import { io } from "socket.io-client";
import {
  IConversation,
  IMessage,
  IMessageInfo,
} from "../interfaces/conversation";
import { IUser, IUserData } from "./interfaces/user";
import { HttpService } from "./services/httpService";

let token: string | null = sessionStorage.getItem("auth-token");
let user: IUser;
const httpService: HttpService = new HttpService();
const loginPage: HTMLElement = document.querySelector(
  ".login-page"
) as HTMLElement;
const chatPage: HTMLElement = document.querySelector(
  ".chats-page"
) as HTMLElement;

if (token) {
  chatPage.style.display = "flex";
  loginPage.style.display = "none";
  getAllChats();
} else {
  chatPage.style.display = "none";
  loginPage.style.display = "block";

  const form = document.getElementById("login-form") as HTMLFormElement;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    console.log(formData);

    await login(formData.email as string, formData.password as string);
  });
}

async function login(email: string, password: string): Promise<void> {
  const res = await httpService.post("/login", { email, password });
  const data: any = await res.json();

  if (res.status === 200) {
    user = data.user;
    sessionStorage.setItem("auth-token", data.token);

    connectToSocketServer();

    loginPage.style.display = "none";
    chatPage.style.display = "flex";

    getAllChats();
  } else {
    const p = document.getElementsByClassName("error")[0] as HTMLElement;
    p.innerText = data;
    const passwordInput: HTMLInputElement = document.getElementById(
      "password"
    ) as HTMLInputElement;
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

async function getAllChats(): Promise<void> {
  const res = await httpService.get(
    "/conversations",
    sessionStorage.getItem("auth-token")!
  );
  const chats: IConversation[] = await res.json();
  const chatsContainer: HTMLDivElement = document.querySelector(
    ".chats"
  ) as HTMLDivElement;

  for (let chat of chats) {
    const chatDiv: HTMLDivElement = document.createElement("div");
    chatDiv.className = "chat";

    const imgContainer: HTMLDivElement = createImageContainer(chat);
    const chatInfoContainer: HTMLDivElement = createChatInfoContainer(chat);
    const moreFeatureContainer: HTMLDivElement =
      createMoreFeatureContainer(chat);

    chatDiv.appendChild(imgContainer);
    chatDiv.appendChild(chatInfoContainer);
    chatDiv.appendChild(moreFeatureContainer);

    chatsContainer.appendChild(chatDiv);
  }

  const listOfI = document.querySelectorAll(".more-features i");

  for (let i of listOfI) {
    i.addEventListener("click", (event: Event) => {
      const currentI: HTMLElement = event.target as HTMLElement;
      const span: HTMLSpanElement = currentI.parentElement?.parentElement
        ?.childNodes[1].childNodes[0] as HTMLSpanElement;
      const chatName: string = span.innerText;
      getCurrentChat(chatName);
    });
  }
}

function createMoreFeatureContainer(chat: IConversation): HTMLDivElement {
  const moreFeatureDiv = document.createElement("div");
  moreFeatureDiv.className = "more-features";
  const i = document.createElement("i");
  i.className = "fa-solid fa-greater-than";
  const p = document.createElement("p");
  if (chat.messages.length > 0) {
    p.innerText = getHowLongAgoMessageWasWritten(
      chat.messages[chat.messages.length - 1].time,
      getCurrentTimeInMinutes()
    );
  }
  moreFeatureDiv.appendChild(i);
  moreFeatureDiv.appendChild(p);

  return moreFeatureDiv;
}

function createChatInfoContainer(chat: IConversation): HTMLDivElement {
  const chatInfoDiv = document.createElement("div");
  chatInfoDiv.className = "chat-info";
  const span: HTMLSpanElement = document.createElement("span");
  span.className = "user-username";
  span.innerHTML = chat.name;
  const p = document.createElement("p");
  if (chat.messages.length > 0) {
    p.innerText = chat.messages[chat.messages.length - 1].text;
  }
  chatInfoDiv.appendChild(span);
  chatInfoDiv.appendChild(p);

  return chatInfoDiv;
}

function createImageContainer(data: {level: number, img: string}): HTMLDivElement {
  const imageContainer: HTMLDivElement = document.createElement("div");
  imageContainer.className = "img-container";
  const span: HTMLSpanElement = document.createElement("span");
  span.className = "level";
  span.innerText = `${data.level}`;
  const img: HTMLImageElement = document.createElement("img");
  img.src = data.img;
  imageContainer.appendChild(span);
  imageContainer.appendChild(img);

  return imageContainer;
}

function getCurrentTimeInMinutes(): number {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

function getHowLongAgoMessageWasWritten(
  messageTime: number,
  currentTime: number
): string {
  const difference = currentTime - messageTime;

  if (difference < 1) {
    return "less than a minute ago";
  } else if (difference < 60) {
    return `${difference} minutes ago`;
  } else {
    return `${difference % 60} hours ago`;
  }
}

async function getCurrentChat(name: string) {
  const res = await httpService.get(
    `/conversations/${name}`,
    sessionStorage.getItem("auth-token")!
  );
  const currentChat: IConversation = await res.json();
  console.log(currentChat);
  const currentChatDiv: HTMLDivElement = document.querySelector(
    ".current-chat"
  ) as HTMLDivElement;
  const messagesContainer: HTMLDivElement = document.querySelector(
    ".messages"
  ) as HTMLDivElement;

  if (currentChat.messages.length > 0) {
    for (let messageInfo of currentChat.messages) {
      const messageContainer: HTMLDivElement =
        createMessageContainer(messageInfo);
      messagesContainer.appendChild(messageContainer);
    }
  }

  currentChatDiv.style.display = "block";
}

function createMessageContainer(message: IMessage): HTMLDivElement {
  const messageDiv:HTMLDivElement = document.createElement('div');
  const imgContainer:HTMLDivElement = createImageContainer({level: message.writer.level, img: message.writer.img});

  const wrapperMessagesContainer: HTMLDivElement = document.createElement('div')
  const messageInfoDiv: HTMLDivElement = document.createElement('div');
  const span:HTMLSpanElement = document.createElement("span");
  span.innerText = message.writer.username;
  const p: HTMLParagraphElement = document.createElement('p');
  p.innerText = message.text;
  messageInfoDiv.appendChild(span);
  messageInfoDiv.appendChild(p);
  const pTimeDiv:HTMLParagraphElement = document.createElement('p');
  pTimeDiv.innerText = getHowLongAgoMessageWasWritten(message.time, getCurrentTimeInMinutes());
  wrapperMessagesContainer.appendChild(messageInfoDiv);
  wrapperMessagesContainer.appendChild(pTimeDiv);

  messageDiv.appendChild(imgContainer);
  messageDiv.appendChild(wrapperMessagesContainer);

  return messageDiv;
}
