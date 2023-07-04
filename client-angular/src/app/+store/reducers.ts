import { createReducer, on } from "@ngrx/store";
import { IConversation, IMessage } from "../shared/interfaces/message";
import { IUser } from "../shared/interfaces/user";
import { addMessage, deleteChat, setChats, setCurrentChat, setMessages, setUser } from "./actions";

export interface IGlobalState {
  messages: IMessage[];
  chats: IConversation[];
  currentChat: IConversation,
  user: IUser;
}

const initialState: IGlobalState = {
  messages: [],
  chats: [],
  currentChat: {
    name: "",
    messages: [],
    img: "",
    level: 0,
  },
  user: {
    username: "",
    email: "",
    img: "",
    level: 0
  }
};


export const globalReducer = createReducer(
  initialState,
  on(addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),
  on(setMessages, (state, { messages }) => ({ ...state, messages })),
  on(setChats, (state, {chats}) => ({...state, chats})),
  on(setCurrentChat, (state, {currentChat}) => ({...state, currentChat})),
  on(setUser, (state, {user}) => ({...state, user})),
  on(deleteChat, (state, {name}) => ({...state, chats: state.chats.filter(c => c.name != name)}))
);
