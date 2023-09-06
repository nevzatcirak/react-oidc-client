import {History} from "history";
import React, {ReactNode, useEffect} from "react";
import {Authenticating} from './components/authenticating';
import {useAuthentication} from './use-authentication';

type SecureAppProps = {
    children: ReactNode;
    history: History;
};

/**
 * Component redirecting to login screen if no user found or the access token expired
 *
 * @public
 */
export const SecureApp = ({children}: SecureAppProps) => {
    const context = useAuthentication();

    if (!context) {
        throw new Error(
            "useAuthentication must be used within a AuthenticationProvider"
        );
    }
    const {oidcUser, login, authenticating} = context;

    useEffect(() => {
        if(!oidcUser) login();
    },[oidcUser]);

    const requiredAuth = !oidcUser || oidcUser?.expired === true;

    const authenticatingComponent = authenticating || <Authenticating/>;
    return requiredAuth ? <>{authenticatingComponent}</> : <>{children}</>;
};
