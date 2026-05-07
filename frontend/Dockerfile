# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
	npm ci --prefer-offline --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
