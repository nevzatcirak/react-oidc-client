import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

interface FormWrapperProps {
  title: string,
  subtitle?: string;
  imgSrc?: string;
}

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },

  logo: {
    maxWidth: 150,
    display: 'inline-block',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  content: {
    marginTop: theme.spacing(1),
    textAlign: 'left',
  }
}))

const FormWrapper = (props: React.PropsWithChildren<FormWrapperProps>) => {
  const classes = useStyles();

  return (
    <Card variant="outlined" className={classes.card}>
      <CardContent>
        <img src={props.imgSrc} alt={process.env.NEXT_PUBLIC_APP_NAME} className={classes.logo} />

        <Typography variant="h5" color="textPrimary">{props.title}</Typography>
        {props.subtitle && (
          <Typography variant="body1" color="textSecondary">{props.subtitle}</Typography>
        )}

        <div className={classes.content}>
          {props.children}
        </div>
      </CardContent>
    </Card>
  );
};

FormWrapper.defaultProps = {
  imgSrc: process.env.NEXT_PUBLIC_LOGO_URL
};

export default FormWrapper;
