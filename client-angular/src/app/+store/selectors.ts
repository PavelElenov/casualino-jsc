import { IState } from '.';
import { createFeatureSelector, createSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';
import { IChatsEntity, ICurrentChatInfo, messagesAdapter } from './reducers';
import { IConversation, IMessage } from '../shared/interfaces/message';
import { Dictionary, EntityState } from '@ngrx/entity';

export const selectChat: MemoizedSelector<
  IState,
  IState
> = createFeatureSelector("chat");
export const chatsSelector = createSelector(selectChat, (state: IState) => state.chatsState);
export const chatsEntitySelector: MemoizedSelector<IState, IChatsEntity> = createSelector(selectChat, (state: IState) => state.chatsEntityState);
export const userSelector = createSelector(selectChat, (state: IState) => state.userState);
export const errorSelector = createSelector(selectChat, (state: IState) => state.errorState);
export const messagesEntitySelector = createSelector(selectChat, (state: IState) => state.messagesState);


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

const { selectAll, selectEntities, selectIds, selectTotal } =
  messagesAdapter.getSelectors<IState>(messagesEntitySelector);

export const selectLastMessagesIdsRead: MemoizedSelectorWithProps<
  IState,
  string,
  IMessage[]
> = createSelector(
  chatsEntitySelector,
  selectEntities,
  (state: IChatsEntity, messages: Dictionary<IMessage>, chatId:string): IMessage[] => {
    const chat = state.entities[chatId]!;
    return chat.lastMessagesIdsRead.map(id => messages[id]!);
  }
);

export const selectOldestMessagesIdsRead: MemoizedSelectorWithProps<
IState,
string,
IMessage[]
> = createSelector(
chatsEntitySelector,
selectEntities,
(state: IChatsEntity, messages: Dictionary<IMessage>, chatId:string): IMessage[] => {
  const chat = state.entities[chatId]!;
  return chat.oldestMessagesIdsRead.map(id => messages[id]!);
}
);

export const selectMessagesByIds = (messagesIds: string[]) => 
createSelector(selectEntities, (entities: Dictionary<IMessage>) => {
  const messages = messagesIds.map(id => entities[id]!);
  return messages;
})