import {
  AuthenticationProvider,
  SecureApp,
  UserManagerSettings,
  CustomEvents,
} from "./index";
import React, { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { getBoolValue } from "./utils/common-utils";

export interface ComposedAuthProviderProps {
  children: ReactNode;
  configuration: UserManagerSettings;
  isActive?: Boolean;
  customEvents?: CustomEvents;
}

export const ComposedAuthProvider = (props: ComposedAuthProviderProps) => {
  const history = useHistory();

  const checkProviderActivity = () => {
    if (getBoolValue(props.isActive))
      return (
        <AuthenticationProvider
          configuration={props.configuration}
          history={history}
          customEvents={props.customEvents}
        >
          <SecureApp history={history}>{props.children}</SecureApp>
        </AuthenticationProvider>
      );
    else return <>{props.children}</>;
  };

  return checkProviderActivity();
};
