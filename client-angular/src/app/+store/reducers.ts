import { createReducer, on } from '@ngrx/store';
import { IConversation, IMessage } from '../shared/interfaces/message';
import { IUser } from '../shared/interfaces/user';
import {
  addChat,
  addLastMessages,
  addMessage,
  addNewMessage,
  clearChats,
  clearCurrentChat,
  clearMessages,
  clearNewMessages,
  clearUser,
  deleteChat,
  deleteMessage,
  likeChat,
  replaceMessageById,
  setChats,
  setCurrentChat,
  setError,
  setMessagesPerPage,
  setUser,
  substractOneNewMessage,
} from './actions';

export interface IChats {
  chats: IConversation[];
}

export interface ICurrentChat {
  currentChat: IConversation | undefined;
  lastMessages: IMessage[];
  newMessagesCount: number;
  messagesPerPage: number | undefined;
}

export interface IUserState {
  user: IUser;
}

export interface IError {
  error: string;
}

const chatsState: IChats = {
  chats: [],
};

const currentChatState: ICurrentChat = {
  currentChat: undefined,
  lastMessages: [],
  newMessagesCount: 0,
  messagesPerPage: undefined
};

const userState: IUserState = {
  user: {
    username: '',
    email: '',
    img: '',
    level: 0,
  },
};

const errorState: IError = {
  error: '',
};

export const chatsReducer = createReducer(
  chatsState,
  on(addChat, (state, { chat }) => ({
    ...state,
    chats: [...state.chats, chat],
  })),
  on(setChats, (state, { chats }) => ({ ...state, chats })),
  on(deleteChat, (state, { id }) => ({
    ...state,
    chats: state.chats.filter((c) => c.id !== id),
  })),
  on(clearChats, () => ({ chats: [] })),
  on(likeChat, (state, {chat}) => ({...state, chats: state.chats.map<IConversation>((c:IConversation) => {
    if(c.name == chat.name){
      return chat;
    }
    return c;
  })}))
);

export const currentChatReducer = createReducer(
  currentChatState,
  on(addMessage, (state, { message }) => ({
    ...state,
    lastMessages: [...state.lastMessages, message],
  })),
  on(addLastMessages, (state, { lastMessages }) => ({ ...state, lastMessages:[...lastMessages, ...state.lastMessages]})),

  on(setCurrentChat, (state, { currentChat }) => ({ ...state, currentChat })),
  on(deleteMessage, (state, { messageId }) => ({
    ...state,
    lastMessages: state.lastMessages.filter((m) => m.id !== messageId),
  })),
  on(addNewMessage, (state) => ({
    ...state,
    newMessagesCount: state.newMessagesCount + 1,
  })),
  on(clearNewMessages, (state) => ({ ...state, newMessagesCount: 0 })),
  on(substractOneNewMessage, (state) => ({
    ...state,
    newMessagesCount: state.newMessagesCount - 1,
  })),
  on(clearCurrentChat, () => ({
    currentChat: undefined,
    lastMessages: [],
    newMessagesCount: 0,
    messagesPerPage: undefined
  })),
  on(clearMessages, (state) => ({...state, messages: []})),
  on(replaceMessageById, (state, {messageId, message}) => ({...state, lastMessages: state.lastMessages.map(messageInfo => {
    if(messageInfo.id === messageId){
      return message;
    }
    return messageInfo
  })})),
  on(setMessagesPerPage, (state, {messagesPerPage}) => ({...state, messagesPerPage}))
);

export const userReducer = createReducer(
  userState,
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearUser, () => ({
    user: {
      username: '',
      email: '',
      img: '',
      level: 0,
    },
  }))
);

export const errorReducer = createReducer(
  errorState,
  on(setError, (state, { error }) => ({ ...state, error }))
);
