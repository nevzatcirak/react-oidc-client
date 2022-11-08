FROM node:12-alpine

WORKDIR /usr/src/app

COPY ./app/package*.json ./
RUN npm install
COPY ./app/ ./

ARG DEBUG
RUN if [ "$DEBUG" != "true" ]; then npm run build; fi

CMD ["npm", "start"]
