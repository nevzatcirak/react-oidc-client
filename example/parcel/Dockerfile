# production env
FROM nginx:1.15.9-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

#COPY --from=build /app/dist /usr/share/nginx/html
COPY dist/ /usr/share/nginx/html/

RUN find /usr/share/nginx/html/ -type d -exec chmod 755 {} + && \
    find /usr/share/nginx/html/ -type f -exec chmod 644 {} +

CMD nginx -g "daemon off;"
