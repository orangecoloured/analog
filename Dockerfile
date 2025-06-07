FROM node:22 AS builder
WORKDIR /app
COPY public ./public
COPY src ./src
COPY index.html ./
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
EXPOSE 3000
RUN npm i
RUN npm run build
RUN npx tsx src/api/index.ts
