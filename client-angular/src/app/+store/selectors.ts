import { IState } from ".";
import {createSelector} from "@ngrx/store";

export const selectGlobal = (state: IState) => state.global;

export const selectMessages = createSelector(
    selectGlobal,
    state => state.messages
);

export const selectChats = createSelector(
    selectGlobal,
    state => state.chats
);

export const selectUser = createSelector(
    selectGlobal,
    state => state.user
);

export const selectCurrentChat = createSelector(
    selectGlobal,
    state => state.currentChat
);

export const selectError = createSelector(
    selectGlobal,
    state => state.error
)