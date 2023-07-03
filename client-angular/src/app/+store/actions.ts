import { createAction, props } from "@ngrx/store";
import { IMessage } from "../shared/interfaces/message";
export const addMessage = createAction(
  "Add message",
  props<{ message: IMessage }>()
);

export const setMessages = createAction(
  "Set messages",
  props<{ messages: IMessage[] }>()
);
