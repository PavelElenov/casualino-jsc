import { createReducer, on } from '@ngrx/store';
import { IConversation, IMessage } from '../shared/interfaces/message';
import { IUser } from '../shared/interfaces/user';
import {
  addChat,
  addMessage,
  addNewMessage,
  clearNewMessages,
  deleteChat,
  deleteMessage,
  setChats,
  setCurrentChat,
  setError,
  setMessages,
  setUser,
} from './actions';

export interface IChats {
  chats: IConversation[];
}

export interface ICurrentChat {
  currentChat: IConversation;
  messages: IMessage[];
  newMessagesCount: number
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
  currentChat: {
    name: '',
    messages: [],
    img: '',
    level: 0,
  },
  messages: [],
  newMessagesCount: 0,
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
  error: ""
}

export const chatsReducer = createReducer(
  chatsState,
  on(addChat, (state, { chat }) => ({
    ...state,
    chats: [...state.chats, chat],
  })),
  on(setChats, (state, { chats }) => ({ ...state, chats })),
  on(deleteChat, (state, { name }) => ({
    ...state,
    chats: state.chats.filter((c) => c.name != name),
  })),
)

export const currentChatReducer = createReducer(
  currentChatState,
  on(addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),
  on(setMessages, (state, { messages }) => ({ ...state, messages })),
  
  on(setCurrentChat, (state, { currentChat }) => ({ ...state, currentChat })),
  on(deleteMessage, (state, { messageText }) => ({
    ...state,
    messages: state.messages.filter((m) => m.text !== messageText),
  })),
  on(addNewMessage, (state) => ({...state, newMessagesCount: state.newMessagesCount + 1})),
  on(clearNewMessages, state => ({...state, newMessagesCount: 0}))
)

export const userReducer = createReducer(
  userState,
  on(setUser, (state, { user }) => ({ ...state, user })),
)

export const errorReducer = createReducer(
  errorState,
  on(setError, (state, { error }) => ({ ...state, error }))
)

