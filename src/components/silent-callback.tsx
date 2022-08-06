import React, {useEffect} from 'react'
import {AuthenticationService} from '../services/authentication-service'

export const SilentCallback = () => {
  useEffect(() => {
    const authService : AuthenticationService = AuthenticationService.getInstance();
    authService.getUserManager()!.signinSilentCallback()
  }, [])

  return <div />
}
