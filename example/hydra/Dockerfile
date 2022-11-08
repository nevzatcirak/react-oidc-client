FROM oryd/hydra:v1.10-alpine

USER root
RUN apk add --no-cache postgresql-client jq
RUN mkdir -p /etc/config/hydra/
RUN chown ory:ory /etc/config/hydra/
USER ory

ENTRYPOINT [""]
