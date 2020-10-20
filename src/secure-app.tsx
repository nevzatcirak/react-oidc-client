import { History } from "history";
import React, { ReactNode, useContext, useEffect } from "react";
import { Authenticating } from "./components/authenticating";
import { AuthenticationContext } from "./context/authentication-provider";

type SecureAppProps = {
  children: ReactNode;
  history: History;
};

/**
 * Component redirecting to login screen if no user found or the access token expired
 */
export const SecureApp = ({ children, history }: SecureAppProps) => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      "useAuthentication must be used within a AuthenticationProvider"
    );
  }
  const { oidcUser, authenticating, login } = context;

  useEffect(() => {
    if (!oidcUser) login(true);
  }, [history, oidcUser]);

  const requiredAuth = !oidcUser || oidcUser?.expired === true;

  const authenticatingComponent = authenticating || <Authenticating />;
  return requiredAuth ? <>{authenticatingComponent}</> : <>{children}</>;
};
