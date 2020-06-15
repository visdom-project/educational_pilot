FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install recharts

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]