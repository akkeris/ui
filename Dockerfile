FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install -g webpack@4.25.1 && npm install && npm cache clean --force
COPY . /usr/src/app
RUN npm run webpack
CMD [ "npm", "start" ]

EXPOSE 3000