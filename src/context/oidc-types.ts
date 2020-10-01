import { User, UserManager } from "oidc-client";

export type Action =
  | { type: "ON_ERROR"; message: string }
  | { type: "ON_LOADING" }
  | { type: "ON_LOAD_USER"; user: User }
  | { type: "ON_UNLOAD_USER" };

export type State = {
  oidcUser?: User;
  userManager: UserManager;
  isLoading: boolean;
  error?: string;
};