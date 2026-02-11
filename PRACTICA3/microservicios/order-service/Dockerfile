FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Puerto REST del order-service
EXPOSE 3002

CMD ["node", "server.js"]
