import { History } from 'history'
import React, { ReactNode, useEffect } from 'react'
import { AuthenticationService } from '../services/authentication-service'

export const Callback = () => (
  <div>
    <div>
      Authentication complete
    </div>
    <div >You will be redirected to your application.</div>
  </div>
)

type CallbackContainerProps = {
  authenticated?: ReactNode
  history: History
}

export const CallbackContainer = ({ authenticated, history }: CallbackContainerProps) => {
  useEffect(() => {
    async function signIn() {
      const authService : AuthenticationService = AuthenticationService.getInstance();
      try {
        const user = await authService.getUserManager()!.signinRedirectCallback()
        if (user.state.url) {
          history.push(user.state.url)
        } else {
          console.warn('no location in state')
        }
      } catch (error) {
        console.error(`Authentication could not be done. Detailed message : ${error.message}`)
        history.push(`/authentication-error?message=${encodeURIComponent(error.message)}`)
      }
    }

    signIn()
  }, [history])

  return authenticated ? <>{authenticated}</> : <Callback />
}
