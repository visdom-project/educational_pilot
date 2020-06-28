FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install recharts --save

RUN npm install axios --save

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
