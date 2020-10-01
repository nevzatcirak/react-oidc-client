import {
  AuthenticationProvider,
  OidcSecure,
  UserManagerSettings,
} from "./index";
import React, { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { getBoolValue } from "./utils/common-utils";

export interface AuthProviderProps {
  children: ReactNode;
  configuration: UserManagerSettings;
  isActive?: Boolean;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const history = useHistory();

  const checkProviderActivity = () => {
    if (getBoolValue(props.isActive))
      return (
        <AuthenticationProvider
          configuration={props.configuration}
          history={history}
        >
          <OidcSecure history={history}>{props.children}</OidcSecure>
        </AuthenticationProvider>
      );
    else return <>{props.children}</>;
  };

  return checkProviderActivity();
};
