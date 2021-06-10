FROM node:14-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package*.json /usr/src/app/
RUN npm install -g webpack@4.41.2
RUN npm install
RUN npm cache clean --force
COPY . /usr/src/app
RUN npm run webpack
RUN rm -rf node_modules
RUN npm install --only=prod
CMD [ "npm", "start" ]

EXPOSE 3000