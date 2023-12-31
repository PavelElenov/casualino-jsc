import { io, Socket } from "socket.io-client";
import {
  IConversation,
  IMessage,
  IMessageInfo,
} from "../shared/interfaces/conversation";
import { IUser } from "./interfaces/user";
import { AppStorage } from "./services/appStorageService";
import { HttpService } from "./services/httpService";

const token: string | null = sessionStorage.getItem("auth-token");
const appStorage = new AppStorage();
let user: IUser;
let conversationName: string;
let socket: Socket;

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

  httpService
    .get("/user", sessionStorage.getItem("auth-token") as string)
    .then((u) => (user = u));

  connectToSocketServer();
  getAllChats();
} else {
  chatPage.style.display = "none";
  loginPage.style.display = "flex";

  const form = document.getElementById("login-form") as HTMLFormElement;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form));

    await login(formData.email as string, formData.password as string);
  });
}

async function login(email: string, password: string): Promise<void> {
  try {
    const data: any = await httpService.post("/login", { email, password });
    user = data.user;
    sessionStorage.setItem("auth-token", data.token);

    connectToSocketServer();

    loginPage.style.display = "none";
    chatPage.style.display = "flex";

    getAllChats();
  } catch (error) {
    const p = document.getElementsByClassName("error")[0] as HTMLElement;
    p.innerText = "Incorrect password or email!";
    const passwordInput: HTMLInputElement = document.getElementById(
      "password"
    ) as HTMLInputElement;
    passwordInput.value = "";

    const inputs: NodeListOf<HTMLInputElement> =
      document.querySelectorAll("input");
    for (let input of inputs) {
      input.addEventListener("focus", () => {
        const loginErrorDiv: HTMLElement = document.querySelector(
          "#login-form .content .error"
        )!;
        if (loginErrorDiv.style.display != "none") {
          loginErrorDiv.style.display = "none";
        }
      });
    }
  }
}

function connectToSocketServer(): void {
  socket = io("http://localhost:3000", {
    transports: ["websocket"],
    query: {
      token: sessionStorage.getItem("auth-token"),
    },
  });

  socket.on("message", (data: IMessageInfo) => {
    console.log("Hi");
    console.log(data);

    if (data.conversation === conversationName) {
      addMessageDiv(data);
    }
  });
}

function addMessageDiv(data: IMessageInfo) {
  const messagesContainer: HTMLDivElement = document.querySelector(
    ".messages"
  ) as HTMLDivElement;
  const messageDiv: HTMLDivElement = createMessageContainer({
    writer: data.writer,
    text: data.text,
    time: data.time,
  });

  messagesContainer?.appendChild(messageDiv);
}

async function getAllChats(): Promise<void> {
  try {
    const chats: IConversation[] = await httpService.get(
      "/conversations",
      appStorage.getToken("auth-token")!
    );

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
  } catch (error: any) {
    displayError(error);
  }
}

function displayError(error: string) {
  loginPage.style.display = "none";
  chatPage.style.display = "none";

  const errorDiv: HTMLDivElement = document.getElementById(
    "error"
  ) as HTMLDivElement;
  errorDiv.innerText = error;
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

function createImageContainer(data: {
  level: number;
  img: string;
}): HTMLDivElement {
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
  conversationName = name;
  try {
    const currentChat: IConversation = await httpService.get(
      `/conversations/${name}`,
      appStorage.getToken("auth-token")!
    );

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

    document
      .querySelector(".write-message")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        const input: HTMLInputElement = document.querySelector(
          ".write-message input"
        ) as HTMLInputElement;
        const messageText: string = input.value;

        socket.emit("message", {
          writer: user,
          text: messageText,
          conversation: name,
          time: getCurrentTimeInMinutes(),
        });

        input.value = "";
        addMessageDiv({
          writer: user,
          text: messageText,
          conversation: name,
          time: getCurrentTimeInMinutes(),
        });
      });
  } catch (error: any) {
    displayError(error);
  }
}

function createMessageContainer(message: IMessage): HTMLDivElement {
  const messageDiv: HTMLDivElement = document.createElement("div");
  message.writer.username === user.username
    ? (messageDiv.className = "message my-message")
    : (messageDiv.className = "message");
  const imgContainer: HTMLDivElement = createImageContainer({
    level: message.writer.level,
    img: message.writer.img,
  });

  const wrapperMessagesContainer: HTMLDivElement =
    document.createElement("div");
  wrapperMessagesContainer.className = "wrapper-messages";
  const messageInfoDiv: HTMLDivElement = document.createElement("div");
  messageInfoDiv.className = "message-info";
  const span: HTMLSpanElement = document.createElement("span");
  span.className = "user-username";
  span.innerText = message.writer.username;
  const p: HTMLParagraphElement = document.createElement("p");
  p.innerText = message.text;
  messageInfoDiv.appendChild(span);
  messageInfoDiv.appendChild(p);
  const pTimeDiv: HTMLParagraphElement = document.createElement("p");
  pTimeDiv.className = "time";
  pTimeDiv.innerText = getHowLongAgoMessageWasWritten(
    message.time,
    getCurrentTimeInMinutes()
  );
  wrapperMessagesContainer.appendChild(messageInfoDiv);
  wrapperMessagesContainer.appendChild(pTimeDiv);

  messageDiv.appendChild(imgContainer);
  messageDiv.appendChild(wrapperMessagesContainer);

  return messageDiv;
}
