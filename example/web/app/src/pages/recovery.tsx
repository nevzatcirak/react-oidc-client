import { Link, makeStyles } from '@material-ui/core';
import { Alert, Color } from '@material-ui/lab';
import { PublicApi as KratosPublicApi, RecoveryFlow, Configuration as KratosConfiguration } from '@ory/kratos-client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import FormWrapper from '../components/form-wrapper';
import KratosForm from '../components/kratos-form';
import { BasePageProps } from '../page-props';

interface RecoverPageProps extends BasePageProps {
  flow?: RecoveryFlow;
}

export const getServerSideProps: GetServerSideProps<RecoverPageProps> = async ({ query }) => {
  if (!query.flow) {
    return {
      redirect: {
        destination: '/self-service/recovery/browser',
        permanent: false,
      },
    };
  }

  const kratos_client = new KratosPublicApi(new KratosConfiguration({ basePath: process.env.NEXT_PUBLIC_BASE_URL }));

  try {
    const res = await kratos_client.getSelfServiceRecoveryFlow(String(query.flow));
    return {
      props: {
        flow: res.data,
      },
    };
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
};

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

const RecoveryPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const classes = useStyles();

  return (
    <>
      <FormWrapper title="Forgot your password?" subtitle="Enter your email address and we will send you instructions to reset your password">
        {(props.flow.messages || []).map((message, index) => (
          <Alert key={index} severity={message.type as Color} className={classes.alert}>{message.text}</Alert>
        ))}

        {Object.values(props.flow.methods || {}).map((method, index) => (
          <KratosForm key={index} config={method.config} method={method.method} />
        ))}
      </FormWrapper>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login" variant="body2" style={{ textAlign: 'center' }}>
          Back to login
        </Link>
      </div>
    </>
  )
};

export default RecoveryPage;
