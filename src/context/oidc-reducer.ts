import { State, Action } from "./oidc-types";

export function oidcReducer(state: State, action: Action) {
  switch (action.type) {
    case "ON_ERROR":
      return { ...state, error: action.message, isLoading: false };
    case "ON_LOADING":
      return { ...state, isLoading: true };
    case "ON_LOAD_USER":
      return { ...state, oidcUser: action.user, isLoading: false };
    case "ON_UNLOAD_USER":
      return { ...state, oidcUser: undefined, isLoading: false };
    default:
      return state;
  }
}
