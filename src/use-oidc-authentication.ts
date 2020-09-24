import { useContext } from 'react'
import { AuthenticationContext } from './context/authentication-provider'

export function useOidcAuthentication() {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error('useOidcAuthentication must be used within a AuthenticationProvider')
  }

  return context
}
