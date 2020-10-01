import { History } from "history";
import { User, UserManagerSettings } from "oidc-client";
import React, {
  createContext,
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { AuthenticationService } from "../services/authentication-service";
import {
  addOidcEvents,
  login,
  logout,
  renewToken,
  oidcReducer,
  removeOidcEvents,
} from "./oidc-events";
import { CallbackContainer } from "../components/callback";
import { OidcRoutes } from "../components/oidc-routes";
import {
  SessionLostContainer,
  SessionLostProps,
} from "../components/session-lost";

export interface AuthenticationContextState {
  isLoading: boolean;
  authenticating?: ReactNode;
  oidcUser?: User;
  error?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  renewToken: () => Promise<void>;
}

export const AuthenticationContext = createContext<
  AuthenticationContextState | undefined
>(undefined);

export interface CustomEvents {
  /** Subscribe to events raised when user session has been established (or re-established) */
  onUserLoaded?: (user: User) => void;
  /** Subscribe to events raised when a user session has been terminated */
  onUserUnloaded?: () => void;
  /** Subscribe to events raised when the automatic silent renew has failed */
  onSilentRenewError?: (error: Error) => void;
  /** Subscribe to events raised when the user's sign-in status at the OP has changed */
  onUserSignedOut?: () => void;
  /** When `monitorSession` subscribe to events raised when the user session changed */
  onUserSessionChanged?: () => void;
  /** Subscribe to events raised prior to the access token expiring */
  onAccessTokenExpiring?: () => void;
  /** Subscribe to events raised after the access token has expired */
  onAccessTokenExpired?: () => void;
}

export interface AuthenticationProviderProps {
  children: ReactNode;
  history: History;
  authenticating?: ReactNode;
  notAuthenticated?: ReactNode;
  notAuthorized?: ReactNode;
  sessionLost?: ElementType<SessionLostProps>;
  callbackComponentOverride?: ReactNode;
  configuration: UserManagerSettings;
  customEvents?: CustomEvents;
}

const setDefaultState = (configuration: UserManagerSettings) => {
  let authService: AuthenticationService = AuthenticationService.initInstance(
    configuration
  );
  return {
    userManager: authService.getUserManager(),
    isLoading: false,
  };
};

export const AuthenticationProvider = (props: AuthenticationProviderProps) => {
  const [oidcState, dispatch] = useReducer(
    oidcReducer,
    setDefaultState(props.configuration)
  );

  useEffect(() => {
    dispatch({ type: "ON_LOADING" });
    addOidcEvents({
      customEvents: props.customEvents,
      dispatch,
      userManager: oidcState.userManager,
    });
    oidcState.userManager.getUser().then((user) => {
      if (!user) {
        return;
      }
      dispatch({ type: "ON_LOAD_USER", user });
    });
    return () =>
      removeOidcEvents({
        customEvents: props.customEvents,
        dispatch,
        userManager: oidcState.userManager,
      });
  }, [oidcState.userManager, props.customEvents]);

  const { oidcUser, isLoading, error } = oidcState;
  const {
    authenticating,
    notAuthenticated,
    notAuthorized,
    callbackComponentOverride,
    sessionLost,
    configuration,
    children,
    history,
  } = props;

  return (
    <AuthenticationContext.Provider
      value={{
        isLoading,
        oidcUser,
        error,
        authenticating,
        login: useCallback(() => login(dispatch, history.location, history)(), [
          history,
          oidcState.userManager,
        ]),
        logout: useCallback(() => logout(dispatch)(), [oidcState.userManager]),
        renewToken: useCallback(() => renewToken()(), [oidcState.userManager]),
      }}
    >
      <OidcRoutes
        notAuthenticated={notAuthenticated}
        notAuthorized={notAuthorized}
        callbackComponent={
          <CallbackContainer
            callbackComponentOverride={callbackComponentOverride}
            history={history}
          />
        }
        sessionLost={
          <SessionLostContainer
            SessionLostComponentOverride={sessionLost}
            history={history}
          />
        }
        configuration={configuration}
      >
        {children}
      </OidcRoutes>
    </AuthenticationContext.Provider>
  );
};