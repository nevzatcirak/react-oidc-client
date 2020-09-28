import { AuthenticationProvider, UserManagerSettings } from './index'
import React, { PropsWithChildren } from 'react'
import { useHistory } from 'react-router-dom'

export const configuration: UserManagerSettings = {
  client_id: 'react',
  // automaticSilentRenew: true,
  redirect_uri: 'http://localhost:3000/authentication/callback',
  response_type: 'code',
  post_logout_redirect_uri: 'http://localhost:3000/',
  scope: 'openid profile email',
  authority: 'http://localhost:8080/auth/realms/master',
  silent_redirect_uri: 'http://localhost:3000/authentication/silent_callback',
}

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const history = useHistory()

  return (
    <AuthenticationProvider configuration={configuration} history={history}>
      {children}
    </AuthenticationProvider>
  )
}
