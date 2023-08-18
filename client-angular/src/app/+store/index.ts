import {
  chatsReducer,
  chatsEntityReducer,
  errorReducer,
  IChats,
  IChatsEntity,
  IError,
  IUserState,
  userReducer,
} from './reducers';
import { ActionReducerMap } from '@ngrx/store';

export interface IState {
  chatsState: IChats;
  chatsEntityState: IChatsEntity;
  userState: IUserState;
  errorState: IError;
}

export const reducers: ActionReducerMap<IState> = {
  chatsState: chatsReducer,
  chatsEntityState: chatsEntityReducer,
  userState: userReducer,
  errorState: errorReducer,
};
