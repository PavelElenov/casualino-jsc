import { IState } from '.';
import { createSelector } from '@ngrx/store';
import { ICurrentChatInfo } from './reducers';
import { IConversation } from '../shared/interfaces/message';

export const chatsSelector = (state: IState) => state.chatsState;
export const chatsEntitySelector = (state: IState) => state.chatsEntityState;
export const userSelector = (state: IState) => state.userState;
export const errorSelector = (state: IState) => state.errorState;

export const selectCurrentChat = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    const selectedChatId: string = chatId;
    const selectedChat: ICurrentChatInfo = state.entities[selectedChatId]!;
    return selectedChat;
  });

export const selectChatById = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    const chat = state.entities[chatId];
    return chat;
  });

export const selectAllMessages = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    const chat = state.entities[chatId]!;
    return chat.allMessages;
  });

export const selectChats = createSelector(
  chatsSelector,
  (state) => state.chats
);

export const selectUser = createSelector(userSelector, (state) => state.user);

export const selectError = createSelector(
  errorSelector,
  (state) => state.error
);

export const selectNewMessages = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    if (chatId) {
      const chat = state.entities[chatId]!;
      return chat.newMessagesCount;
    }
    return 0;
  });

export const selectLikesOfChat = (chatName: string) =>
  createSelector(chatsSelector, (state) => {
    const chat = state.chats.find((c) => c.name == chatName);
    return chat?.likes;
  });

export const selectMessagesPerPage = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    if (chatId) {
      const chat = state.entities[chatId]!;
      return chat.messagesPerPage;
    }
    return null;
  });

export const selectWaitingForLastMessages = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    if (chatId) {
      const chat = state.entities[chatId]!;
      return chat.waitingForNewMessages;
    }
    return false;
  });

export const selectLastPage = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    if (chatId) {
      const chat = state.entities[chatId]!;
      return chat.lastPage;
    }
    return false;
  });

export const selectMessageError = (chatId: string) =>
  createSelector(chatsEntitySelector, (state) => {
    const chat = state.entities[chatId]!;
    return chat.messageError;
  });

export const selectLastMessagesCounter = (chatId: string) => 
createSelector(chatsEntitySelector, (state) => {
  const chat = state.entities[chatId]!;
  return chat.lastMessagesCounter;
});

export const selectOldestMessagesCounter = (chatId: string) => 
createSelector(chatsEntitySelector, (state) => {
  const chat = state.entities[chatId]!;
  return chat.oldestMessagesCounter;
});

export const selectLastMessages = (chatId: string) => 
createSelector(chatsEntitySelector, (state) => {
  const chat = state.entities[chatId]!;
  const lastMessagesCounter = chat.lastMessagesCounter;
  return chat.allMessages.slice(chat.allMessages.length - lastMessagesCounter - 1, chat.allMessages.length - 1)
});

export const selectOldestMessages = (chatId: string) => 
createSelector(chatsEntitySelector, (state) => {
  const chat = state.entities[chatId]!;
  const oldestMessagesCounter = chat.oldestMessagesCounter;
  return chat.allMessages.slice(0, oldestMessagesCounter);
})
