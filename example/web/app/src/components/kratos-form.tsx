import { Button, ButtonProps, Divider, makeStyles, TextField } from '@material-ui/core';
import { GitHub as GitHubIcon } from '@material-ui/icons';
import { Alert, Color } from '@material-ui/lab';
import { FormField, LoginFlowMethodConfig, RegistrationFlowMethodConfig } from '@ory/kratos-client';
import React from 'react';

interface KratosFormProps {
  buttonPrefix: string;
  config: LoginFlowMethodConfig | RegistrationFlowMethodConfig;
  method: string;
  divider?: boolean;
}

const field_translations = {
  to_verify: {
    title: 'Your email address',
    position: 0,
    icon: null,
  },
  identifier: {
    title: 'Username or Email address',
    position: 0,
    icon: null,
  },
  'email': {
    title: 'Email address',
    position: 1,
    icon: null,
  },
  'traits.email': {
    title: 'Email address',
    position: 1,
    icon: null,
  },
  password: {
    title: 'Password',
    position: 2,
    icon: null,
  },
  'traits.username': {
    title: 'Username',
    position: 3,
    icon: null,
  },
  'traits.name.first': {
    title: 'First Name',
    position: 4,
    icon: null,
  },
  'traits.name.last': {
    title: 'Last Name',
    position: 5,
    icon: null,
  },
  'traits.website': {
    title: 'Website',
    position: 6,
    icon: null,
  },
  'github': {
    title: 'GitHub',
    position: 0,
    icon: GitHubIcon,
  },
  'gitlab': {
    title: 'GitLab',
    position: 1,
    icon: null,
  },
  'google': {
    title: 'Google',
    position: 2,
    icon: null,
  },
};

type FieldTranslations = typeof field_translations;

const useStyles = makeStyles(theme => ({
  buffered: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: "white"
  },

  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const KratosForm = (props: KratosFormProps) => {
  const classes = useStyles();

  const getFieldPosition = (field: FormField) =>
    field.name && field.name in field_translations
      ? field_translations[field.name as keyof FieldTranslations].position
      : Infinity;

  const getLabel = (key: string) => key in field_translations
    ? field_translations[key as keyof FieldTranslations].title
    : key;

  const getIcon = (key: string) => key in field_translations
    ? field_translations[key as keyof FieldTranslations].icon
    : null;

  const sorted_fields = props.config.fields.sort(
    (first: FormField, second: FormField) => getFieldPosition(first) - getFieldPosition(second)
  );

  let messages = props.config.messages || [];
  sorted_fields.forEach(field => {
    if (field.messages) {
      messages.push(...field.messages);
    }
  });

  return (
    <form method={props.config.method} action={props.config.action}>
      {messages.map((message, index) => (
        <Alert key={index} severity={message.type as Color} className={classes.alert}>{message.text}</Alert>
      ))}

      {sorted_fields.map(field => {
        switch (field.type) {
          case 'hidden':
            return <input key={field.name} type={field.type} name={field.name} value={String(field.value)}  />;
          case 'submit':
            return (
              <Button
                key={field.name}
                type={field.type}
                name={field.name}
                fullWidth
                disableElevation
                variant="contained"
                startIcon={React.createElement(getIcon(String(field.value)))}
                className={classes.buffered}
                component={React.forwardRef<HTMLButtonElement, Partial<ButtonProps>>(
                  (props, ref) => <button ref={ref} value={String(field.value)} {...props} />
                )}
              >
                {props.buttonPrefix} {getLabel(String(field.value))}
              </Button>
            );
          default:
            return (
              <TextField
                key={field.name}
                variant="outlined"
                margin="normal"
                fullWidth
                type={field.type}
                required={field.required}
                name={field.name}
                label={getLabel(field.name)}
                defaultValue={field.value}
                error={Boolean(field.messages)}
              />
            );
        }
      })}

      {['password', 'link'].includes(props.method) && (
        <Button type="submit" color="primary" variant="contained" fullWidth disableElevation className={classes.buffered}>Continue</Button>
      )}

      {props.divider && (
        <Divider className={classes.buffered} />
      )}
    </form>
  );
};

KratosForm.defaultProps = {
  buttonPrefix: 'Log in with',
  divider: false,
};

export default KratosForm;
