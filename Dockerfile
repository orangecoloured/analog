FROM node:22 AS builder
WORKDIR /app
COPY public ./public
COPY src ./src
COPY index.html ./
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
ARG VITE_ANALOG_API_GET_REQUEST_QUEUE
ARG VITE_ANALOG_API_GET_REQUEST_CLEAN_UP
ENV VITE_ANALOG_API_GET_REQUEST_QUEUE=$VITE_ANALOG_API_GET_REQUEST_QUEUE
ENV VITE_ANALOG_API_GET_REQUEST_CLEAN_UP=$VITE_ANALOG_API_GET_REQUEST_CLEAN_UP
RUN npm install && npm run build

FROM node:22
WORKDIR /app
COPY src ./src
COPY package*.json ./
COPY tsconfig.json ./
COPY --from=builder /app/dist ./src/services/server/dist
RUN npm install
CMD ["npx", "tsx", "src/services/server/index.ts"]
