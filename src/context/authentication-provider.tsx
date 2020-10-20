import { History } from "history";
import { User, UserManagerSettings, UserManager } from "oidc-client";
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
  removeOidcEvents,
} from "./oidc-actions";
import { oidcReducer } from "./oidc-reducer";
import { CallbackContainer } from "../components/authenticated";
import { OidcRoutes } from "../components/auth-routes";
import {
  SessionLostContainer,
  SessionLostProps,
} from "../components/session-lost";

export interface AuthenticationContextState {
  isLoading: boolean;
  oidcUser?: User;
  error?: string;
  authenticating?: ReactNode;
  login: (force?: boolean) => Promise<void>;
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
  onUserUnloaded?: (userManager: UserManager) => void;
  /** Subscribe to events raised when the automatic silent renew has failed */
  onSilentRenewError?: (error: Error) => void;
  /** Subscribe to events raised when the user's sign-in status at the OP has changed */
  onUserSignedOut?: (userManager: UserManager) => void;
  /** When `monitorSession` subscribe to events raised when the user session changed */
  onUserSessionChanged?: (userManager: UserManager) => void;
  /** Subscribe to events raised prior to the access token expiring */
  onAccessTokenExpiring?: () => void;
  /** Subscribe to events raised after the access token has expired */
  onAccessTokenExpired?: (userManager: UserManager) => void;
}

export interface AuthenticationProviderProps {
  children: ReactNode;
  history: History;
  authenticating?: ReactNode;
  unauthenticated?: ReactNode;
  unauthorized?: ReactNode;
  sessionlost?: ElementType<SessionLostProps>;
  authenticated?: ReactNode;
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
    unauthenticated,
    unauthorized,
    authenticated,
    sessionlost,
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
        login: useCallback((force?: boolean) => login(dispatch, history.location, history)(force), [
          history,
          oidcState.userManager,
        ]),
        logout: useCallback(() => logout(dispatch)(), [oidcState.userManager]),
        renewToken: useCallback(() => renewToken()(), [oidcState.userManager]),
      }}
    >
      <OidcRoutes
        unauthenticated={unauthenticated}
        unauthorized={unauthorized}
        callbackComponent={
          <CallbackContainer
            authenticated={authenticated}
            history={history}
          />
        }
        sessionlost={
          <SessionLostContainer
            SessionLostComponentOverride={sessionlost}
            history={history}
            autoAuthenticate={true}
          />
        }
        configuration={configuration}
      >
        {children}
      </OidcRoutes>
    </AuthenticationContext.Provider>
  );
};
