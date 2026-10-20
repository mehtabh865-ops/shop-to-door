FROM node:20-alpine

WORKDIR /usr/src/node-app

COPY package*.json ./

RUN npm install --omit=dev --no-audit

COPY . .

RUN chown -R node:node /usr/src/node-app

USER node

EXPOSE 5000

CMD ["node", "src/index.js"]
