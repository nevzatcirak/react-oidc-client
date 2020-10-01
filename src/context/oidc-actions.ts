import { History, Location } from "history";
import { User, UserManager } from "oidc-client";
import { Dispatch } from "react";
import { CustomEvents } from "./authentication-provider";
import { AuthenticationService } from "../services/authentication-service";
import { Action } from "./oidc-types";

type oidcEventsOptions = {
  customEvents?: CustomEvents;
  dispatch: Dispatch<Action>;
  userManager: UserManager;
};

export const addOidcEvents = ({
  dispatch,
  userManager,
  customEvents,
}: oidcEventsOptions) => {
  userManager.events.addUserLoaded((user) => {
    customEvents?.onUserLoaded?.(user);
    onUserLoaded(dispatch, user);
  });
  userManager.events.addSilentRenewError((error) => {
    customEvents?.onSilentRenewError?.(error);
    onError(dispatch, error);
  });
  userManager.events.addUserUnloaded(() => {
    customEvents?.onUserUnloaded?.();
    onUserUnloaded(dispatch, userManager);
  });
  userManager.events.addUserSignedOut(() => {
    customEvents?.onUserSignedOut?.();
    onUserUnloaded(dispatch, userManager);
  });
  userManager.events.addAccessTokenExpired(() => {
    customEvents?.onAccessTokenExpired?.();
    onAccessTokenExpired(dispatch, userManager);
  });

  if (customEvents?.onAccessTokenExpiring) {
    userManager.events.addAccessTokenExpiring(
      customEvents.onAccessTokenExpiring
    );
  }
  if (customEvents?.onUserSessionChanged) {
    userManager.events.addUserSessionChanged(customEvents.onUserSessionChanged);
  }
};

export const removeOidcEvents = ({
  dispatch,
  userManager,
  customEvents,
}: oidcEventsOptions) => {
  userManager.events.removeUserLoaded((user) => {
    customEvents?.onUserLoaded?.(user);
    onUserLoaded(dispatch, user);
  });
  userManager.events.removeSilentRenewError((error) => {
    customEvents?.onSilentRenewError?.(error);
    onError(dispatch, error);
  });
  userManager.events.removeUserUnloaded(() => {
    customEvents?.onUserUnloaded?.();
    onUserUnloaded(dispatch, userManager);
  });
  userManager.events.removeUserSignedOut(() => {
    customEvents?.onUserSignedOut?.();
    onUserUnloaded(dispatch, userManager);
  });
  userManager.events.removeAccessTokenExpired(() => {
    customEvents?.onAccessTokenExpired?.();
    onAccessTokenExpired(dispatch, userManager);
  });

  if (customEvents?.onAccessTokenExpiring) {
    userManager.events.removeAccessTokenExpiring(
      customEvents.onAccessTokenExpiring
    );
  }

  if (customEvents?.onUserSessionChanged) {
    userManager.events.removeUserSessionChanged(
      customEvents.onUserSessionChanged
    );
  }
};

export const logout = (dispatch: Dispatch<Action>) => async () => {
  const authService: AuthenticationService = AuthenticationService.getInstance();
  try {
    await authService.logout();
  } catch (error) {
    onError(dispatch, error);
  }
};

export const login = (
  dispatch: Dispatch<Action>,
  location: Location,
  history: History
) => async () => {
  dispatch({ type: "ON_LOADING" });
  const authService: AuthenticationService = AuthenticationService.getInstance();
  await authService.authenticate(location, history)();
};

export const renewToken = () => async () => {
  const authService: AuthenticationService = AuthenticationService.getInstance();
  await authService.renewToken();
};

export const onError = (dispatch: Dispatch<Action>, error: Error) => {
  dispatch({ type: "ON_ERROR", message: error.message });
};

export const onUserLoaded = (dispatch: Dispatch<Action>, user: User) => {
  dispatch({ type: "ON_LOAD_USER", user });
};

export const onUserUnloaded = (
  dispatch: Dispatch<Action>,
  userManager: UserManager
) => {
  dispatch({ type: "ON_UNLOAD_USER" });
  userManager.clearStaleState();
};

export const onAccessTokenExpired = async (
  dispatch: Dispatch<Action>,
  userManager: UserManager
) => {
  dispatch({ type: "ON_UNLOAD_USER" });
  await userManager.signinSilent();
};
