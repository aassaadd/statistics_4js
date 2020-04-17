FROM node:6
MAINTAINER zhc aassaadd@qq.com
COPY ./bin /app/bin
COPY ./models /app/models
COPY ./public /app/public
COPY ./routes /app/routes
COPY ./views /app/views
COPY ./app.js /app/app.js
COPY ./jsSdkConfig.js /app/jsSdkConfig.js
COPY ./package.json /app/package.json
COPY ./node_modules /app/node_modules
EXPOSE 3000
WORKDIR /app/
RUN  ["npm", "install"]
ENTRYPOINT ["npm", "start"]