import { Card, CardContent, Container, makeStyles } from '@material-ui/core';
import { ErrorPageProps } from '../page-props';

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
}));

const ErrorComponent = (props: ErrorPageProps) => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <Card variant="outlined" className={classes.card}>
        <CardContent>
          {props.message}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ErrorComponent;
