FROM node:0.10-slim
MAINTAINER goern@b4mad.net

LABEL Version="0.1.0"

WORKDIR /app

EXPOSE 1337

# install dependencies
ADD package.json /app/
RUN npm install

# install app
RUN mkdir -p /app/routes
ADD server.js /app/
ADD consts.js /app/
ADD routes/ /app/routes/

ENTRYPOINT ["node", "server.js"]
