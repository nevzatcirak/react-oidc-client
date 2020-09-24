import { History, Location } from 'history'
import { Log, User, UserManager, UserManagerSettings } from "oidc-client";

export class AuthenticationService {
  private static instance: AuthenticationService;
  public userManager: UserManager;
  private userRequested: Boolean = false;
  private numberAuthentication: number = 0;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(configuration: UserManagerSettings) {
    this.userManager = new UserManager(configuration);
    Log.logger = console;
    Log.level = Log.INFO;
  }

  /**
   * Initialize openid connection configs and creates singleton instance of AuthenticationFacade
   * @param configuration
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
   * Authenticate oidc user
   * @param user 
   * @param location 
   * @param history 
   */
  public authenticate(
    location: Location,
    history: History,
    user: User | null = null,
  ): any {
    return async (isForce = false, callbackPath: string | null = null) => {
      let oidcUser = user
      if (!oidcUser) {
        oidcUser = await this.userManager.getUser()
      }
      if (this.userRequested) {
        return
      }
      this.numberAuthentication++
      const url = callbackPath || location.pathname + (location.search || '')
    
      if (this.isRequireSignin(oidcUser, isForce)) {
        this.userRequested = true
        await this.userManager.signinRedirect({ data: { url } })
        this.userRequested = false
      } else if (oidcUser?.expired) {
        this.userRequested = true
        try {
          await this.userManager.signinSilent()
        } catch (error) {
          if (this.numberAuthentication <= 1) {
            await this.userManager.signinRedirect({ data: { url } })
          } else {
            this.userRequested = false
            history.push(`/authentication/session-lost?path=${encodeURI(url)}`)
          }
        }
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
      await this.userManager.signoutRedirect()
    }
  }

  /**
   * Checks whether user should sign in or not. If isForce parameter is 'true', 
   * this will always return true 
   */
  private isRequireSignin = (oidcUser: User | null, isForce: boolean) => isForce || !oidcUser
}
