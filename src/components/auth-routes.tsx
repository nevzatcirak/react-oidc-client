import {UserManagerSettings} from 'oidc-client-ts'
import React, {memo, ReactNode, useEffect, useState} from 'react'
import {getPath} from '../utils/route-utils'
import {UnAuthenticated} from './unauthenticated'
import {UnAuthorized} from './unauthorized'
import {SilentCallback} from './silent-callback'

export type OidcRoutesProps = {
  unauthenticated?: ReactNode
  unauthorized?: ReactNode
  callbackComponent: ReactNode
  sessionlost?: ReactNode
  configuration: UserManagerSettings
  children: ReactNode
}

const AuthRoutesComponent = ({
  unauthenticated = <UnAuthenticated />,
  unauthorized = <UnAuthorized />,
  callbackComponent,
  sessionlost,
  configuration,
  children,
}: OidcRoutesProps) => {
  const [path, setPath] = useState(window.location.pathname)

  const setNewPath = () => setPath(window.location.pathname)
  useEffect(() => {
    setNewPath()
    window.addEventListener('popstate', setNewPath, false)
    return () => window.removeEventListener('popstate', setNewPath, false)
  })

  const silentCallbackPath = getPath(configuration.silent_redirect_uri)
  const callbackPath = getPath(configuration.redirect_uri)
  
  switch (path) {
    case callbackPath:
      return <>{callbackComponent}</>
    case silentCallbackPath:
      return <SilentCallback />
    case '/authentication-error':
      return <>{unauthenticated}</>
    case '/authorization-error':
      return <>{unauthorized}</>
    case '/session-lost':
      return <>{sessionlost}</>
    default:
      return <>{children}</>
  }
}

export const OidcRoutes = memo(AuthRoutesComponent)
