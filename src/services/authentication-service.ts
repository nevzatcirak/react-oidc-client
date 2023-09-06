import {Log, User, UserManager, UserManagerSettings} from "oidc-client-ts";
import {Location} from 'history';

/**
 * @public
 */
export class AuthenticationService {
    private static instance: AuthenticationService;
    public userManager: UserManager;
    private userRequested: Boolean = false;
    // private numberAuthentication: number = 0;
    private configuration: UserManagerSettings;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor(configuration: UserManagerSettings) {
        this.configuration = configuration;
        this.userManager = new UserManager(configuration);
        Log.setLogger(console);
        Log.setLevel(Log.INFO)
    }

    /**
     * Initialize openid connection configs and creates singleton instance of AuthenticationFacade
     */
    public static initInstance(configuration: UserManagerSettings): AuthenticationService {
        if (!AuthenticationService.instance) {
            AuthenticationService.instance = new AuthenticationService(configuration);
        }

        return AuthenticationService.instance;
    }

    /**
     * Gets Instance of Authentication Facade which manages user informations
     */
    public static getInstance(): AuthenticationService {
        return AuthenticationService.instance;
    }

    /**
     * Gets User claims which contains access_token, refresh_token, token_type
     * scope, profile etc..
     * Details are in the User Object
     */
    public getUser(): Promise<User | null> {
        return this.userManager.getUser();
    }

    /**
     * Gets user manager of oidc client
     */
    public getUserManager(): UserManager {
        return this.userManager;
    }

    /**
     * Gets user manager settings of oidc client
     */
    public getConfiguration(): UserManagerSettings {
        return this.configuration;
    }

    /**
     * Authenticate oidc user
     */
    public authenticate(
        location: Location,
        user: User | null = null,
    ): any {
        return async (isForce = false, callbackPath: string | null = null) => {
            let oidcUser = user
            if (!oidcUser) {
                oidcUser = await this.userManager.getUser()
            }
            if (this.userRequested)
                return
            const url = callbackPath || location.pathname + (location.search || '')
            if (this.isRequireSignin(oidcUser, isForce)) {
                this.userRequested = true
                await this.userManager.signinRedirect({
                    state: {url},
                    //@ts-ignore
                    id_token_hint: oidcUser && oidcUser.id_token ? oidcUser?.id_token : ""
                })
                this.userRequested = false
            }
        }
    }

    /**
     * Logout authenticated oidc user
     */
    public async logout() {
        const oidcUser = await this.userManager.getUser()
        if (oidcUser) {
            const userManager = new UserManager({...this.configuration, response_mode: "query"});
            await userManager.clearStaleState()
            await userManager.signoutRedirect()
        }
    }

    /**
     * Sends renew token request
     */
    public async renewToken(): Promise<User | null | undefined> {
        const oidcUser = await this.userManager?.getUser?.();
        if (oidcUser) {
            try {
                return await this.userManager.signinSilent();
            } catch (error) {
                console.error(error)
                //@TODO Decide after talking to HAP team
                /*await this.userManager.signinRedirect({
                    prompt: "login"
                });*/
            }
        }
    }

    /**
     * Checks whether user should sign in or not. If isForce parameter is 'true',
     * this will always return true
     */
    private isRequireSignin = (oidcUser: User | null, isForce: boolean) => isForce || !oidcUser
}
