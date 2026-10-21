# Live demo: build the frontend with the in-browser mock API (npm run build:demo), serve it with Caddy.
# Build context is the repo root (see docker-compose.yml). The full production stack is in fullstack/.
FROM node:22-alpine AS build
WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build:demo

FROM caddy:2.11-alpine
COPY --from=build /src/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
