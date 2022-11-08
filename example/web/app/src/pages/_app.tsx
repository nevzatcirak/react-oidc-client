import { Container, CssBaseline, ThemeProvider } from '@material-ui/core';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import ErrorComponent from '../components/error';
import theme from '../theme';

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {pageProps.error ? (
          <ErrorComponent {...pageProps.error} />
        ) : (
          <Container component="main" maxWidth="xs">
            <Component {...pageProps} />
          </Container>
        )}
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
