import { IState } from ".";
import {createSelector} from "@ngrx/store";

export const chatsSelector = (state: IState) => state.chats;
export const currentChatSelector = (state: IState) => state.currentChat;
export const userSelector = (state: IState) => state.user;
export const errorSelector = (state: IState) => state.error

export const selectMessages = createSelector(
    currentChatSelector,
    state => state.lastMessages
);

export const selectChats = createSelector(
    chatsSelector,
    state => state.chats
);

export const selectUser = createSelector(
    userSelector,
    state => state.user
);

export const selectCurrentChat = createSelector(
    currentChatSelector,
    state => state.currentChat
);

export const selectError = createSelector(
    errorSelector,
    state => state.error
);

export const selectNewMessages = createSelector(
    currentChatSelector,
    state => state.newMessagesCount
);

export const selectLikesOfChat = (chatName: string) => createSelector(
    chatsSelector,
    state => {
        const chat = state.chats.find(c => c.name == chatName);
        return chat?.likes;
    }
)