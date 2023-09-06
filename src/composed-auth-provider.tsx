import {AuthenticationProvider, CustomEvents, SecureApp, UserManagerSettings,} from "./index";
import React, {ReactNode} from "react";
import {useHistory} from "react-router-dom";
import {getBoolValue} from "./utils/common-utils";

/**
 * @public
 */
export interface ComposedAuthProviderProps {
  children: ReactNode;
  configuration: UserManagerSettings;
  isActive?: Boolean;
  customEvents?: CustomEvents;
  authenticating?: ReactNode;
  unauthenticated?: ReactNode;
  unauthorized?: ReactNode;
  authenticated?: ReactNode;
}

/**
 * @public
 */
export const ComposedAuthProvider = (props: ComposedAuthProviderProps) => {
  const history = useHistory();

  const checkProviderActivity = () => {
    if (getBoolValue(props.isActive))
      return (
        <AuthenticationProvider
          history={history}
          {...props}
        >
          <SecureApp history={history}>{props.children}</SecureApp>
        </AuthenticationProvider>
      );
    else return <>{props.children}</>;
  };

  return checkProviderActivity();
};
