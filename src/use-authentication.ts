import {useContext} from 'react'
import {AuthenticationContext} from './context/authentication-provider'

export function useAuthentication() {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('useAuthentication must be used within a AuthenticationProvider')
  }

  return context
}
