import {Grid, Link, makeStyles} from '@material-ui/core';
import {Alert, Color} from '@material-ui/lab';
import {AdminApi as HydraAdminApi, Configuration as HydraConfiguration} from '@ory/hydra-client';
import {LoginFlow, PublicApi as KratosPublicApi, Configuration as KratosConfiguration} from '@ory/kratos-client';
import crypto from 'crypto';
import {GetServerSideProps, GetServerSidePropsResult, InferGetServerSidePropsType} from 'next';
import React from 'react';
import FormWrapper from '../components/form-wrapper';
import KratosForm from '../components/kratos-form';
import withIronSession from '../middleware/with-iron-session';
import {BasePageProps} from '../page-props';

const SESSION_STATE_KEY = 'hydra_login_state';

interface LoginPageProps extends BasePageProps {
    return_to: string;
    flow: LoginFlow;
}

const initLoginSession = async ({req, query}): Promise<GetServerSidePropsResult<LoginPageProps>> => {
    const state = crypto.randomBytes(48).toString('hex');
    req.session.set(SESSION_STATE_KEY, state);

    const return_to = new URL(`/login`, process.env.NEXT_PUBLIC_BASE_URL);
    return_to.searchParams.set(SESSION_STATE_KEY, state);
    return_to.searchParams.set('login_challenge', query.login_challenge);

    const destination = new URL(`/self-service/login/browser`, process.env.NEXT_PUBLIC_BASE_URL);
    destination.searchParams.set('return_to', return_to.toString());

    // We also want to save the return to address so we don't lose it if we trigger other flows (e.g. signup)
    req.session.set('return_to', return_to.toString());
    await req.session.save();

    return {
        redirect: {
            destination: destination.toString(),
            permanent: false,
        },
    };
};

export const getServerSideProps: GetServerSideProps<LoginPageProps> = withIronSession(async (ctx) => {
    const {req, query} = ctx;
    const kratos_client = new KratosPublicApi(new KratosConfiguration({ basePath: process.env.NEXT_PUBLIC_BASE_URL }));

    // Check if we're handling the Hydra OAuth flow
    if (query.login_challenge) {
        const hydra_admin_client = new HydraAdminApi(new HydraConfiguration({basePath: process.env.HYDRA_ADMIN_URL}));

        try {
            const {data: login_request} = await hydra_admin_client.getLoginRequest(String(query.login_challenge));

            // If auth can be skipped, accept the request and redirect
            if (login_request.skip) {
                const {data: accepted_request} = await hydra_admin_client.acceptLoginRequest(String(query.login_challenge), {
                    subject: login_request.subject,
                });
                await req.session.destroy();
                return {
                    redirect: {
                        destination: accepted_request.redirect_to,
                        permanent: false,
                    },
                };
            }

            // If the session doesn't match, we haven't started the auth request. Let's kick if off.
            if (!req.session.get(SESSION_STATE_KEY) || query[SESSION_STATE_KEY] !== req.session.get(SESSION_STATE_KEY)) {
                return initLoginSession(ctx);
            }

            // We know we have a valid session state. Let's grab the Kratos session and accept the Hydra request.
            const {data: login_session} = await kratos_client.whoami(req.headers['cookie'], req.headers['Authorization']);
            const {data: accepted_request} = await hydra_admin_client.acceptLoginRequest(query.login_challenge, {
                subject: login_session.identity.id,
                context: login_session,
                remember: false,
                remember_for: 0,
            });
            await req.session.destroy();
            return {
                redirect: {
                    destination: accepted_request.redirect_to,
                    permanent: false,
                },
            };
        } catch (err) {
            // If the login challenge is invalid, throw an error
            return {
                props: {
                    error: {
                        statusCode: err?.response?.data?.error?.code,
                        message: err?.response?.data?.error?.message,
                    },
                }
            };
        }
    }

    // If there's not flow ID, we didn't land here via the proper channels
    if (!query.flow) {
        return {
            props: {
                error: {
                    statusCode: 400,
                    message: 'The login flow was not initialized correctly. Please be sure to initialize via oauth.',
                }
            }
        }
    }

    try {
        const res = await kratos_client.getSelfServiceLoginFlow(String(query.flow));
        return {
            props: {
                flow: res.data,
                return_to: req.session.get('return_to'),
            }
        }
    } catch (err) {
        return {
            props: {
                error: {
                    statusCode: err?.response?.data?.error?.message.code,
                    message: err?.response?.data?.error?.message.message,
                },
            }
        };
    }
});

const useStyles = makeStyles(theme => ({
    alert: {
        textAlign: 'left',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }
}));

const LoginPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const classes = useStyles();

    const sorted_methods = [];
    const {password, oidc, ...methods} = props.flow.methods;
    if (password) {
        sorted_methods.push(password);
    }

    if (oidc) {
        sorted_methods.push(oidc);
    }

    sorted_methods.push(...Object.values(methods));

    return (
        <>
            <FormWrapper
                title="Welcome back"
                subtitle={`Log in below to continue to ${process.env.NEXT_PUBLIC_APP_NAME}`}
            >
                {(props.flow.messages || []).map((message, index) => (
                    <Alert key={index} severity={message.type as Color} className={classes.alert}>{message.text}</Alert>
                ))}

                {sorted_methods.map((method, index) => <KratosForm key={index} config={method.config}
                                                                   method={method.method}
                                                                   divider={index + 1 < sorted_methods.length}/>)}
            </FormWrapper>

            <Grid container>
                <Grid item xs>
                    <Link href="/recovery" variant="body2">
                        Forgot password?
                    </Link>
                </Grid>
                <Grid item>
                    <Link href={`/self-service/registration/browser?return_to=${encodeURIComponent(props.return_to)}`}
                          variant="body2">
                        Don't have an account? Sign up.
                    </Link>
                </Grid>
            </Grid>
        </>
    )
};

export default LoginPage;
