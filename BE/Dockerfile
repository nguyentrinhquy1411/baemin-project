FROM node:20

WORKDIR /home/app

COPY package*.json ./

RUN yarn config set network-timeout 3000000

RUN yarn

COPY ./src/prisma/ ./src/prisma/

RUN yarn prisma generate --schema=./src/prisma/schema.prisma

COPY . .

EXPOSE 8080

CMD [ "yarn", "start"]