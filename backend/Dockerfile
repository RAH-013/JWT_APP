FROM node:24.14.0-alpine

WORKDIR /node_app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]