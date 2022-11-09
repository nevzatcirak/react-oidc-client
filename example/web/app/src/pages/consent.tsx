import { Button, Checkbox, FormControlLabel, FormGroup, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { AdminApi as HydraAdminApi, ConsentRequest, Configuration as HydraConfiguration } from '@ory/hydra-client';
import { PublicApi as KratosPublicApi, Configuration as KratosConfiguration } from '@ory/kratos-client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import FormWrapper from '../components/form-wrapper';
import withIronSession from '../middleware/with-iron-session';
import { BasePageProps } from '../page-props';

interface ConsentPageProps extends BasePageProps {
  consent_request: ConsentRequest;
}

export const getServerSideProps: GetServerSideProps<ConsentPageProps> = withIronSession(async ({ req, query }) => {
  if (!query.consent_challenge) {
    return {
      props: {
        error: {
          statusCode: 400,
          message: 'Invalid login session',
        },
      },
    };
  }

  const hydra_admin_client = new HydraAdminApi(new HydraConfiguration({ basePath: process.env.HYDRA_ADMIN_URL }));
  const kratos_client = new KratosPublicApi(new KratosConfiguration({ basePath: process.env.KRATOS_PUBLIC_URL }));

  try {
    const { data: consent_request } = await hydra_admin_client.getConsentRequest(query.consent_challenge);

    if (consent_request.skip || ((consent_request.client.metadata as any).first_party || false)) {
      const { data: login_session } = await kratos_client.whoami(req.headers['cookie'], req.headers['Authorization']);
      const traits = login_session.identity.traits as any;
      const { data: accepted_request } = await hydra_admin_client.acceptConsentRequest(query.consent_challenge, {
        grant_scope: consent_request.requested_scope,
        grant_access_token_audience: consent_request.requested_access_token_audience,
        remember: false,
        remember_for: 0,
        session: {
          access_token: {
            email: traits.email,
            email_verified: !!login_session.identity.verifiable_addresses.find(addr => addr.value === traits.email && addr.verified),
            nickname: traits.username,
            nevzat: "benim adım nevzat"
          },
          id_token: {
            email: traits.email,
            email_verified: !!login_session.identity.verifiable_addresses.find(addr => addr.value === traits.email && addr.verified),
            nickname: traits.username,
            nevzat: "benim adım nevzat cirak"
          },
        }
      });

      return {
        redirect: {
          destination: accepted_request.redirect_to,
          permanent: false,
        },
      };
    }

    return { props: { consent_request } };
  } catch (err) {
    return {
      props: {
        error: {
          statusCode: err?.response?.data?.error?.code,
          message: err?.response?.data?.error?.message,
        },
      }
    };
  }
});

const useStyles = makeStyles(theme => ({
  rememberText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(),
  },

  buttonWrapper: {
    marginTop: theme.spacing(2),

    '& > *': {
      marginRight: theme.spacing(1),
    }
  }
}));

const ConsentPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const classes = useStyles();
  const { challenge, client, requested_scope } = props.consent_request;

  return (
    <FormWrapper
      title="Authorization"
      subtitle={`The application, ${client.client_name || client.client_id}, wants to act on your behalf with the following access:`}
      {...(client.logo_uri ? { imgSrc: client.logo_uri } : {})}
    >
      <form method="POST" action="/api/consent">
        <input type="hidden" name="challenge" value={challenge} />

        <FormGroup>
          {requested_scope.map((scope, index) => (
            <FormControlLabel key={index} label={scope} control={
              <Checkbox name="grant_scope" color="primary" id={scope} value={scope} />
            } />
          ))}
        </FormGroup>

        <Typography variant="body2" className={classes.rememberText}>
          Do you want to be asked next time when this application wants to access your data? The application will not be able to ask for more permissions without your consent.
        </Typography>

        <Grid container justify="space-evenly">
          {client.policy_uri && (
            <Grid item>
              <Link href={client.policy_uri} variant="body2">
                Privacy policy
              </Link>
            </Grid>
          )}
          {client.tos_uri && (
            <Grid item>
              <Link href={client.tos_uri} variant="body2">
                Terms of service
              </Link>
            </Grid>
          )}
        </Grid>

        <FormGroup>
          <FormControlLabel label="Do not ask me again" control={<Checkbox id="remember" name="remember" value="1" />} />
        </FormGroup>

        <div className={classes.buttonWrapper}>
          <Button variant="contained" disableElevation color="primary" type="submit" value="allow">Allow access</Button>
          <Button variant="contained" disableElevation type="submit" value="deny">Deny access</Button>
        </div>

      </form>
    </FormWrapper>
  )
};

export default ConsentPage;
