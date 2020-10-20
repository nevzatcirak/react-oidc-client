# @nevzatcirak/react-oidc-client

> **@nevzatcirak/react-oidc-client** package is a convenience wrapper around the `oidc-client` library to make it available in React by using hooks and context api.

> [**oidc-client**](https://github.com/IdentityModel/oidc-client-js/wiki) is a JavaScript library intended to run in browsers. It provides protocol support for OIDC and OAuth2, as well as management functions for user sessions and access tokens management.

### Usage
There are 3 components and 1 hook that you can use. They are ***`ComposedAuthProvider`***, ***`AuthenticationProvider`***, ***`SecureApp`*** and ***`useAuthentication`***.

##### ***SecureApp***
***SecureApp*** component will manage authenticating and the access token expired situation. Also, this component will redirect app to login screen, when no user found. 

> ***Hint:*** This component must be used inside the ***`BrowserRouter`*** and ***`AuthenticationProvider`***.

***Props***

|Mandatory      | Name            | Description                             |
|:------------: | ------------- | :-------------------------------------:   |       
| ✔             | children        | Child components of the component       |
| ✔             | history         | Navigation object is from react-router  |
 

##### ***AuthenticationProvider***
***`AuthenticationProvider`*** components manages passing oidc configuration object and custom events functions to oidc-client services. This component is main part of the Openid Connect/OAuth 2.0 Client to connect Authorization Servers.

***Props***

|Mandatory      | Name            | Description                             |
|:------------: | ------------- | -------------------------------------   |       
| ✔             | children        | Child components of the component       |
| ✔             | history         | Navigation object is from react-router  |
| ✔             | configuration   | Configuration object of oidc-client. Details are [here](https://github.com/IdentityModel/oidc-client-js/wiki#configuration).|
| ❔             | customEvents    | Oidc events, such as userSignedOut, accessTokenExpired, are listening inside. Defined methods in customEvents props will be called in related listeners. ``Hint: Declared methods should be used in useCallback.``|
| ❔             | authenticating  | Component will be shown while trying to authenticate and when `SecureApp` is used and no user is logged in. |
| ❔             | unathenticated  | Component will be shown when history route in **`/authentication-error`**. |
| ❔             | unauthorized    | Component will be shown when authorization error is risen up and  history route in **``/authorization-error``**. |
| ❔             | sessionlost     | Component will be shown when session is lost and history route in **``/session-lost``**. |
| ❔             | authenticated   | Component will be shown when login process is successfully done. |


> These 5 components, which are `authenticating`, `unauthenticated`, `unauthorized`, `sessionlost` and `authenticated`, are just for information widgets.

##### ***ComposedAuthProvider***
In ***`ComposedAuthProvider`*** component, ***`AuthenticationProvider`*** and SecureApp are utilized together to make a magical provider. This provider manages both oidc user existence and passing a configuration object to work properly.

***Props***

|Mandatory      | Name            | Description                             |
|:------------: | -------------   | -------------------------------------   |       
| ✔             | children        | Child components of the component       |
| ✔             | configuration   | Configuration object of oidc-client. This property is same with ***AuthenticationProvider’s configuration*** property.|
| ❔             | isActive        | This prop is related with provider activity status. If value is true, provider will be active and openid client will begin to work.        |
| ❔             | customEvents    | Oidc events, such as userSignedOut, accessTokenExpired, are listening inside. Defined methods in customEvents props will be called in related listeners. ``Hint: Declared methods should be used in useCallback.``|


##### ***useAuthentication***
This hook is created by using ***`AuthenticationContext`***. *AuthenticationContext* properties are defined in table below.

> ***Hint:*** This hook must be used in the ***`AuthenticationProvider`***.


***AuthenticationContext State***

|Name           | Type                  | Description                             |
|------------   | --------------------  | ---------------|       
| isLoading     | boolean               | Openid User loading status. ``(Default: false)`` |
| oidcUser      | User (details here)   | Openid User ``(Default: undefined)``|
| error         | String                | An error message while logging in or out Openid User ``(Default: undefined)`` |
| authenticating | ReactNode (exp: here)| Authenticating component is using in ***SecureApp*** component, when Openid User is expired or logged out. ``(Default: undefined)`` |
| login         | (force: boolean)=>Promise<void>| Login method triggers login action if login is required or ``force`` parameter value is ``false``.  |
| logout        | () => Promise<void>              | Logout method triggers SSO process.|
| renewToken    | () => Promise<void>              | Sends renew token request Auth server and renews token.   |
