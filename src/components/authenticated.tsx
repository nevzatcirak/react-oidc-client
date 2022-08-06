import {History} from 'history'
import React, {ReactNode, useEffect} from 'react'
import {AuthenticationService} from '../services/authentication-service'

export const Callback = () => (
    <div>
        <div>
            Authentication complete
        </div>
        <div>You will be redirected to your application.</div>
    </div>
)

type CallbackContainerProps = {
    authenticated?: ReactNode
    history: History
}

const handleError = async (type: String, message: String, history: History, authService: AuthenticationService) => {
    try {
        if (type === "login_required" || type === "invalid_request") {
            await authService.authenticate(history.location)
        } else if (!!authService?.getConfiguration?.()?.post_logout_redirect_uri)
            //@ts-ignore
            window.location.href = authService.getConfiguration().post_logout_redirect_uri || "/";
        else
            history.push("/")
        console.error(`Authentication could not be done. Error type: ${type}, Detailed message : ${message}`)
    } catch (e) {
        await authService.logout();
    }
}

export const CallbackContainer = ({authenticated, history}: CallbackContainerProps) => {
    useEffect(() => {
        async function signIn() {
            const authService: AuthenticationService = AuthenticationService.getInstance();
            try {
                const user = await authService.getUserManager()!.signinRedirectCallback()
                //@ts-ignore
                if (user.state.url) {
                    //@ts-ignore
                    history.push(user.state.url)
                } else {
                    console.warn('no location in state')
                }
            } catch (error) {
                //@ts-ignore
                await handleError(error.error, error.message, history, authService);
            }
        }

        signIn()
    }, [history])

    return authenticated ? <>{authenticated}</> : <Callback/>
}
