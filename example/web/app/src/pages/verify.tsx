import { Button, makeStyles } from '@material-ui/core';
import { Alert, Color } from '@material-ui/lab';
import { PublicApi as KratosPublicApi, VerificationFlow, Configuration as KratosConfiguration } from '@ory/kratos-client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import FormWrapper from '../components/form-wrapper';
import KratosForm from '../components/kratos-form';
import withIronSession from '../middleware/with-iron-session';
import { BasePageProps } from '../page-props';

interface VerifyPageProps extends BasePageProps {
  return_to?: string;
  flow?: VerificationFlow;
}

export const getServerSideProps: GetServerSideProps<VerifyPageProps> = withIronSession(async ({ req, query }) => {
  let return_to = query.return_to && String(query.return_to);
  if (return_to) {
    req.session.set('return_to', return_to);
    await req.session.save();
  } else {
    return_to = req.session.get('return_to');
  }

  if (!query.flow) {
    return {
      redirect: {
        destination: '/self-service/verification/browser',
        permanent: false,
      },
    };
  }

  try {
    const kratos_client = new KratosPublicApi(new KratosConfiguration({ basePath: process.env.NEXT_PUBLIC_BASE_URL }));
    const { data: flow } = await kratos_client.getSelfServiceVerificationFlow(String(query.flow));

    // If the flow is complete, destroy the session cache
    if (flow.state === 'passed_challenge') {
      await req.session.destroy();
    }

    return { props: { return_to, flow } };
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
  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

const VerifyPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const classes = useStyles();

  if (props.flow.state === 'passed_challenge') {
    return (
      <FormWrapper
        title="Verification successful"
        subtitle={`Thanks for verifying your email address. Click the button below to continue on to ${process.env.NEXT_PUBLIC_APP_NAME}.`}
      >
        <Button color="primary" variant="contained" fullWidth disableElevation href={props.return_to}>Continue to {process.env.NEXT_PUBLIC_APP_NAME}</Button>
      </FormWrapper>
    );
  } else {
    return (
      <FormWrapper title="Email verification" subtitle="A verification email has been sent to the address specified during signup. If you need to resend this verification, type in your email below:">
        {(props.flow.messages || []).map((message, index) => (
          <Alert key={index} severity={message.type as Color} className={classes.alert}>{message.text}</Alert>
        ))}

        {Object.values(props.flow.methods || {}).map((method, index) => (
          <KratosForm key={index} config={method.config} method={method.method} />
        ))}
      </FormWrapper>
    );
  }
};

export default VerifyPage;
