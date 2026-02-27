FROM node:24.14.0-alpine

WORKDIR /react_app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]