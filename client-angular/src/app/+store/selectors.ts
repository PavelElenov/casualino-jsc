import { IState } from ".";
import {createSelector} from '@ngrx/store';

export const selectGlobal = (state: IState) => state.global;

export const selectMessages = createSelector(
    selectGlobal,
    state => state.messages
)