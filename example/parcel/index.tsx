import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import {ComposedAuthProvider, useAuthentication, WebStorageStateStore } from "../../src/.";

const rootPath = "http://localhost:1234/";

export const webStorageStateStore = new WebStorageStateStore({store: window.localStorage});

export const configuration = {
    client_id: "oidc-infra",
    redirect_uri: rootPath + "authentication-callback",
    response_type: "code",
    post_logout_redirect_uri: rootPath,
    scope: "openid offline_access",
    authority: "http://localhost/hydra",
    silent_redirect_uri: rootPath + "authentication-silent_callback",
    //accessTokenExpiringNotificationTime: 5,
    automaticSilentRenew: false,
    userStore: webStorageStateStore
};


function App() {
    const auth = useAuthentication();

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.oidcUser) {
        return (
            <div>
                Hello {auth?.oidcUser?.profile.sub}{" "}
                <button onClick={() => void auth.renewToken()}>
                    Renew Token
                </button>
                <button onClick={() => void auth.logout()}>
                    Log out
                </button>
            </div>
        );
    }

    return <button onClick={() => void auth.login()}>Log in</button>;
}

ReactDOM.render(
    <BrowserRouter>
        <ComposedAuthProvider configuration={configuration} isActive={true}>
            <App />
        </ComposedAuthProvider>
    </BrowserRouter>,
    document.getElementById("root"),
);
