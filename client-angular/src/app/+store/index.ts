import { chatsReducer, currentChatReducer, errorReducer, IChats, ICurrentChat, IError, IUserState, userReducer } from "./reducers";
import { ActionReducerMap } from "@ngrx/store";

export interface IState {
  chats: IChats,
  currentChat: ICurrentChat,
  user: IUserState,
  error: IError
}

export const reducers: ActionReducerMap<IState> = {
  chats: chatsReducer,
  currentChat: currentChatReducer,
  user: userReducer,
  error: errorReducer
};
