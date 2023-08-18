import { IState } from '.';
import { createSelector } from '@ngrx/store';
import { ICurrentChatInfo } from './reducers';

export const chatsSelector = (state: IState) => state.chatsState;
export const chatsEntitySelector = (state: IState) => state.chatsEntityState;
export const userSelector = (state: IState) => state.userState;
export const errorSelector = (state: IState) => state.errorState;

export const selectCurrentChat = createSelector(
  chatsEntitySelector,
  (state) => {
    const selectedChatId: string = state.selectedChatId!;
    const selectedChat: ICurrentChatInfo = state.entities[selectedChatId]!;
    return selectedChat;
  }
);

export const selectChatById = (chatId: string) => createSelector(
    chatsEntitySelector,
    state => {
        const chat = state.entities[chatId];
        return chat;
    }
)

export const selectMessages = createSelector(chatsEntitySelector, (state) => {
  if (state.selectedChatId) {
    const chat = state.entities[state.selectedChatId!]!;
    return chat.lastMessages;
  }
  return [];
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

export const selectNewMessages = createSelector(
  chatsEntitySelector,
  (state) => {
    if (state.selectedChatId) {
      const chat = state.entities[state.selectedChatId!]!;
      return chat.newMessagesCount;
    }
    return 0;
  }
);

export const selectLikesOfChat = (chatName: string) =>
  createSelector(chatsSelector, (state) => {
    const chat = state.chats.find((c) => c.name == chatName);
    return chat?.likes;
  });

export const selectMessagesPerPage = createSelector(
  chatsEntitySelector,
  (state) => {
    if (state.selectedChatId) {
      const chat = state.entities[state.selectedChatId!]!;
      return chat.messagesPerPage;
    }
    return null;
  }
);

export const selectWaitingForLastMessages = createSelector(
  chatsEntitySelector,
  (state) => {
    if (state.selectedChatId) {
      const chat = state.entities[state.selectedChatId!]!;
      return chat.waitingForNewLastMessages;
    }
    return false;
  }
);

export const selectLastPage = createSelector(chatsEntitySelector, (state) => {
  if (state.selectedChatId) {
    const chat = state.entities[state.selectedChatId!]!;
    return chat.lastPage;
  }
  return false;
});
