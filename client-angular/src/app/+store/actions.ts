import { createAction, props } from "@ngrx/store";
import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";
import { IError } from "../shared/interfaces/error";
import { IConversation, IMessage } from "../shared/interfaces/message";
import { IUser } from "../shared/interfaces/user";
export const addMessage = createAction(
  "Add message",
  props<{ message: IMessage }>()
);

export const setMessages = createAction(
  "Set messages",
  props<{ messages: IMessage[] }>()
);

export const setChats = createAction(
  "Set chats",
  props<{chats: IConversation[]}>()
);

export const setCurrentChat = createAction(
  "Set current chat",
  props<{currentChat: IConversation}>()
);

export const setUser = createAction(
  "Set User",
  props<{user: IUser}>()
);

export const deleteChat = createAction(
  "Delete Chat",
  props<{name: string}>()
);

export const deleteMessage = createAction(
  "Delete Message",
  props<{messageText: string}>()
);

export const addChat = createAction(
  "Add Chat",
  props<{chat: IConversation}>()
);

export const setError = createAction(
  "Set Data",
  props<{error: IError}>()
)
