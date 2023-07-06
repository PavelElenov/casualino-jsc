import { createAction, props } from "@ngrx/store";
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
  props<{error: string}>()
);

export const addNewMessage = createAction(
  "Add new message",
);

export const clearNewMessages = createAction(
  "Clear new messages"
)


