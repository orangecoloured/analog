FROM node:22 AS builder
WORKDIR /app
COPY public ./public
COPY src ./src
COPY index.html ./
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
RUN npm install && npm run build

FROM node:22
WORKDIR /app
COPY src ./src
COPY package*.json ./
COPY tsconfig.json ./
COPY --from=builder /app/dist ./src/services/server/dist
RUN npm install typescript tsx
CMD ["npx", "tsx", "src/services/server/index.ts"]
