import {
  chatsReducer,
  chatsEntityReducer,
  errorReducer,
  IChats,
  IChatsEntity,
  IError,
  IUserState,
  userReducer,
  messagesEntityReducer,
} from './reducers';
import { ActionReducerMap } from '@ngrx/store';
import { IMessage } from '../shared/interfaces/message';
import { EntityState } from '@ngrx/entity';

export interface IState {
  chatsState: IChats;
  chatsEntityState: IChatsEntity;
  userState: IUserState;
  errorState: IError;
  messagesState: EntityState<IMessage>
}

export const reducers: ActionReducerMap<IState> = {
  chatsState: chatsReducer,
  chatsEntityState: chatsEntityReducer,
  userState: userReducer,
  errorState: errorReducer,
  messagesState: messagesEntityReducer
};
