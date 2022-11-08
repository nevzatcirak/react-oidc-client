import { Link, makeStyles } from '@material-ui/core';
import { Alert, Color } from '@material-ui/lab';
import { PublicApi as KratosPublicApi, RegistrationFlow, Configuration as KratosConfiguration } from '@ory/kratos-client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import FormWrapper from '../components/form-wrapper';
import KratosForm from '../components/kratos-form';
import withIronSession from '../middleware/with-iron-session';
import { BasePageProps } from '../page-props';

interface SignupPageProps extends BasePageProps {
  return_to: string;
  flow?: RegistrationFlow;
}

export const getServerSideProps: GetServerSideProps<SignupPageProps> = withIronSession(async ({ req, query }) => {
  if (!query.flow) {
    return {
      error: {
        statusCode: 400,
        message: 'Invalid session ID',
      },
    }
  }

  try {
    const kratos_client = new KratosPublicApi(new KratosConfiguration({ basePath: process.env.NEXT_PUBLIC_BASE_URL }));
    const res = await kratos_client.getSelfServiceRegistrationFlow(String(query.flow));
    return {
      props: {
        return_to: req.session.get('return_to'),
        flow: res.data,
      }
    }
  } catch (err) {
    return {
      props: {
        error: {
          statusCode: err.response.data.error.code,
          message: err.response.data.error.message,
        },
      }
    };
  }
});

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },

  logo: {
    maxWidth: 150,
    display: 'inline-block',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

const SignupPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const classes = useStyles();

  const sorted_methods = [];
  const { password, oidc, ...methods } = props.flow.methods;
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
        title="Welcome"
        subtitle={`Sign up below to continue to ${process.env.NEXT_PUBLIC_APP_NAME}`}
      >
        {(props.flow.messages || []).map((message, index) => (
          <Alert key={index} severity={message.type as Color} className={classes.alert}>{message.text}</Alert>
        ))}

        {sorted_methods.map((method, index) => <KratosForm key={index} buttonPrefix="Sign up with" config={method.config} method={method.method} divider={index + 1 < sorted_methods.length} />)}
      </FormWrapper>

      <div style={{ textAlign: 'center' }}>
        <Link href={`/self-service/login/browser?return_to=${encodeURIComponent(props.return_to)}`} variant="body2">
          Already have an account? Log in.
        </Link>
      </div>
    </>
  )
};

export default SignupPage;
