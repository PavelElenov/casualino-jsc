import {
  IConversation,
  IConversationMoreInfo,
  IConversationWithoutId,
  IMessage,
  IMessages,
  IMessageInfo
} from "../../shared/interfaces/conversation";
import { IUserSomeInfo } from "../../shared/interfaces/user";
import { getCurrentTimeInMinutes } from "./timeService";
import { getUserByUsername } from "./userService";
import { v4 as uuid } from "uuid";

interface IConversationAndLastMessagesCount {
  conversationId: number;
  lastMessagesCount: number;
}

let conversations: IConversation[] = [
  {
    id: "1",
    name: "1",
    img: "https://i.pinimg.com/736x/f5/35/1b/f5351b460de396c8dfa2c9937f1f211c.jpg",
    level: 20,
    likes: 0,
  },
  {
    id: "2",
    name: "2",
    img: "https://img.playbuzz.com/image/upload/ar_1.5,c_pad,f_jpg,b_auto/q_auto:good,f_auto,fl_lossy,w_480,c_limit,dpr_1/cdn/132af0ca-7be7-4cd8-84e3-9ad41df5c6a7/61791061-eb65-4342-a5f4-af1ae165edef_560_420.jpg",
    level: 30,
    likes: 0,
  },
  {
    id: "3",
    name: "3",
    img: "https://png.pngtree.com/background/20230519/original/pngtree-three-smiling-faces-in-sunglasses-on-a-dark-background-picture-image_2657621.jpg",
    level: 40,
    likes: 0,
  },
  {
    id: "4",
    name: "4",
    img: "https://cdn-icons-png.flaticon.com/512/6540/6540753.png",
    level: 50,
    likes: 0,
  },
];
const messages: IMessage[] = []
for(let i = 0; i < 30; i++){
    messages.push({ id: uuid(),
      writer: {
          username: "Pavel",
          level: 10,
          img: "",
      },
      text: i.toString(),
      time: Date.now() + i } )
}

let allMessagesInfo: IMessages[] = [
  {
    conversationId: "1",
    messages: messages,
  },
  {
    conversationId: "2",
    messages: [],
  },
  {
    conversationId: "3",
    messages: [],
  },
  {
    conversationId: "4",
    messages: [],
  },
];
const messagesPerPage = 6;

export function getMessagesPerPage(): number {
  return messagesPerPage;
}

export function getLastMessagesOfConversation(
  conversationId: string,
  lastMessageId: string | undefined
): IMessage[]{
  let startIndex: number;
  let endIndex: number;
  let lastMessage: IMessage | undefined = undefined;

  const currentConversationMessages: IMessage[] = allMessagesInfo.find(
    (data) => data.conversationId === conversationId
  )!.messages;
   
  if (!lastMessageId) {
    startIndex = currentConversationMessages.length - messagesPerPage - 1;
    endIndex = currentConversationMessages.length;
  }else{
    lastMessage = currentConversationMessages.find(
      (m) => m.id === lastMessageId
    )!;
    startIndex =
      currentConversationMessages.indexOf(lastMessage) - messagesPerPage; //This start index can be negative number
    endIndex = currentConversationMessages.indexOf(lastMessage);
  }

  if(currentConversationMessages.length > 0){
    const lastMessages = currentConversationMessages.slice(
      Math.max(0, startIndex),
      endIndex
    );
    return lastMessages;
  } 
  return [];
  
}
export function returnUniqueId(): string {
  return uuid();
}
export function addLike(conversationName: string): void {
  const conversation: IConversation = conversations.find(
    (c) => c.name == conversationName
  )!;
  conversation.likes += 1;
}

export const createNewConversation = (
  newChat: IConversationWithoutId
): IConversation => {
  const conversation = { ...newChat, id: returnUniqueId() };
  conversations.push(conversation);
  allMessagesInfo.push({ conversationId: conversation.id, messages: [] });
  return conversation;
};

export const deleteMessage = (
  conversationId: string,
  messageId: string
): void => {
  const messagesInfo: IMessages = allMessagesInfo.find(
    (data) => data.conversationId === conversationId
  )!;
  const message: IMessage = messagesInfo.messages.find(
    (m) => m.id === messageId
  )!;
 
  const messageIndex: number = messagesInfo.messages.indexOf(message);
  messagesInfo.messages.splice(messageIndex, 1);
};
export const deleteChatById = (conversationId: string): void => {
  const conversation: IConversation = conversations.find(
    (c) => c.id === conversationId
  )!;
  const index: number = conversations.indexOf(conversation);
  conversations.splice(index, 1);
};
export const getAllChats = (): IConversationMoreInfo[] => {
  const allConversations = conversations.map((c) => {
    const messagesInfo = allMessagesInfo.find(
      (data) => data.conversationId === c.id
    );
    const lastMessage =
      messagesInfo?.messages[messagesInfo.messages.length - 1];
    return { ...c, lastMessage };
  });
  return allConversations;
};

export const addMessage = (
  data: IMessageInfo
): IMessage => {
  const messagesInfo: IMessages = allMessagesInfo.find(
    (messageInfo) => messageInfo.conversationId === data.conversationId
  )!;

  const writer: IUserSomeInfo = getUserByUsername(data.writer.username);

  const message: IMessage = {
    id: returnUniqueId(),
    writer: writer,
    text: data.text,
    time: data.time,
  };
  messagesInfo.messages.push(message);
  return message;
};

export const getConversationById = (
  conversationId: string
): IConversation | Error => {
  const conversation: IConversation | undefined = conversations.find(
    (c) => c.id === conversationId
  );

  if (conversation) {
    return conversation;
  }

  throw new Error(`Conversation with this name doesn"t exist!`);
};
