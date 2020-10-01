import { Container, Typography } from "@material-ui/core";
import { History } from "history";
import React, { ElementType, useEffect } from "react";
import { AuthenticationService } from "../services/authentication-service";

export type SessionLostProps = {
  onAuthenticate: () => void;
};

export const SessionLost = () => (
  <Container maxWidth="sm">
    <Typography component="h1" gutterBottom>
      Session timed out
    </Typography>
    <Typography variant="body1">
      Your session has expired. Trying to reauthenticate.
    </Typography>
  </Container>
);

type SessionLostContainerProps = {
  history: History;
  SessionLostComponentOverride?: ElementType<SessionLostProps>;
  autoAuthenticate: boolean;
};

export const SessionLostContainer = ({
  history,
  SessionLostComponentOverride,
  autoAuthenticate,
}: SessionLostContainerProps) => {
  const callbackPath = history.location.search.replace("?path=", "");

  const onAuthenticate = () => {
    const authService: AuthenticationService = AuthenticationService.getInstance();
    authService.authenticate(history.location, history)(true, callbackPath);
  };

  useEffect(() => {
    if (autoAuthenticate) onAuthenticate();
  }, []);

  return SessionLostComponentOverride ? (
    <SessionLostComponentOverride onAuthenticate={onAuthenticate} />
  ) : (
    <SessionLost />
  );
};
