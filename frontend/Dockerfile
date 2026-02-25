FROM node:20-alpine

WORKDIR /react

COPY react/package*.json ./
RUN npm install

COPY react/ .

EXPOSE 5173
CMD ["npm", "run", "dev"]