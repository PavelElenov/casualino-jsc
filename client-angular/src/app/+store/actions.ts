import { Update } from "@ngrx/entity";
import { createAction, props } from "@ngrx/store";
import { IConversation, IMessage } from "../shared/interfaces/message";
import { IUser } from "../shared/interfaces/user";
import { ICurrentChatInfo } from "./reducers";
export const addMessage = createAction(
  "Add message",
  props<{ chatId: string, message: IMessage }>()
);

export const addMessageToChatByChatId = createAction(
  "Add message to chat",
  props<{chatId: string, message: IMessage}>()
)

export const addLastMessages = createAction(
  "Set last messages",
  props<{ chatId: string, lastMessages: IMessage[] }>()
);

export const addOldestMessages = createAction(
  "Add oldest messages",
  props<{chatId: string, messages: IMessage[]}>()
);

export const setChats = createAction(
  "Set chats",
  props<{chats: IConversation[]}>()
);

export const setUser = createAction(
  "Set User",
  props<{user: IUser}>()
);

export const deleteChat = createAction(
  "Delete Chat",
  props<{id: string}>()
);

export const deleteMessage = createAction(
  "Delete Message",
  props<{chatId: string, messageId: string}>()
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
  props<{chatId: string}>()
);

export const clearNewMessages = createAction(
  "Clear new messages",
  props<{chatId: string}>()
);

export const substractOneNewMessage = createAction(
  "Substract new message",
  props<{chatId: string}>()
);

export const clearUser = createAction(
  "Clear user"
);

export const clearChats = createAction(
  "Clear chats"
);

export const clearMessages = createAction(
  "Clear messages"
);

export const likeChat = createAction(
  "Like chat",
  props<{chat: IConversation}>()
);

export const replaceMessageById = createAction(
  "Replace message",
  props<{chatId: string, messageId: string, message: IMessage}>()
);

export const setMessagesPerPage = createAction(
  "Set messages per page",
  props<{chatId: string, messagesPerPage: number}>()
);

export const setLastPageEqualsToTrue = createAction(
  "Set last page is equals to true",
  props<{chatId: string}>()
);

export const setWaitingForMessages = createAction(
  "Set waiting for messages",
  props<{chatId: string, value: boolean}>()
);

export const updateChatsEnity = createAction(
  "Update chats",
  props<{chat: Update<ICurrentChatInfo>}>()
);

export const setSelectedChatId = createAction(
  "Set selected chat id",
  props<{chatId: string}>()
);

export const clearChat = createAction(
  "Clear selected chat id",
  props<{chatId: string}>()
);

export const setMessageError = createAction(
  "Set message error",
  props<{chatId: string, value: string | null}>()
);

export const addMessageToOldestMessages = createAction(
  "Add message to oldest messages",
  props<{chatId: string, message:IMessage}>()
)


