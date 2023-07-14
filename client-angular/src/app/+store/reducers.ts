import { createReducer, on } from '@ngrx/store';
import { IConversation, IMessage } from '../shared/interfaces/message';
import { IUser } from '../shared/interfaces/user';
import {
  addChat,
  addMessage,
  addNewMessage,
  clearChats,
  clearCurrentChat,
  clearMessages,
  clearNewMessages,
  clearUser,
  deleteChat,
  deleteMessage,
  setChats,
  setCurrentChat,
  setError,
  setMessages,
  setUser,
  substractOneNewMessage,
} from './actions';

export interface IChats {
  chats: IConversation[];
}

export interface ICurrentChat {
  currentChat: IConversation | undefined;
  messages: IMessage[];
  newMessagesCount: number;
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
  error: '',
};

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
  on(clearChats, () => ({ chats: [] }))
);

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
    messages: [],
    newMessagesCount: 0,
  })),
  on(clearMessages, (state) => ({...state, messages: []}))
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
