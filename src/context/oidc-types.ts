import {User, UserManager} from "oidc-client-ts";

export type Action =
  | { type: "ON_ERROR"; message: string }
  | { type: "ON_LOADING" }
  | { type: "ON_LOAD_USER"; user: User | null }
  | { type: "ON_UNLOAD_USER" }

export type State = {
  oidcUser?: User | null;
  userManager: UserManager;
  isLoading: boolean;
  error?: string;
};