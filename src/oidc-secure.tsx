import { History } from 'history'
import React, { ReactNode, useContext, useEffect } from 'react'
import { AuthenticationService } from './services/authentication-service'
import { Authenticating } from './components/authenticating'
import { AuthenticationContext } from './context/authentication-provider'

type OidcSecureProps = {
  children: ReactNode
  history: History
}

/**
 * Component redirecting to login screen if no user found or the access token expired
 */
export const OidcSecure = ({ children, history }: OidcSecureProps) => {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('useOidcAuthentication must be used within a AuthenticationProvider')
  }
  const { oidcUser, authenticating } = context

  useEffect(() => {
    const authService : AuthenticationService = AuthenticationService.getInstance();
    authService.authenticate(history.location, history)()
  }, [history])

  const requiredAuth = !oidcUser || oidcUser?.expired === true

  const authenticatingComponent = authenticating || <Authenticating />
  return requiredAuth ? <>{authenticatingComponent}</> : <>{children}</>
}
