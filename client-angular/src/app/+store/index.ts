import { globalReducer, IGlobalState } from "./reducers";
import { ActionReducerMap } from "@ngrx/store";

export interface IState {
  global: IGlobalState;
}

export const reducers: ActionReducerMap<IState> = {
  global: globalReducer,
};
