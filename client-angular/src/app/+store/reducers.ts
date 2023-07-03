import { createReducer, on } from '@ngrx/store';
import { IMessage } from '../shared/interfaces/message';
import { addMessage, setMessages } from './actions';

export interface IGlobalState {
  messages: IMessage[];
}

const initialState: IGlobalState = {
  messages: [],
};

export const globalReducer = createReducer(
  initialState,
  on(addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),
  on(setMessages, (state, { messages }) => ({ ...state, messages }))
);
