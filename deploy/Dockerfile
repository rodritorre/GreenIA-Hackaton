# Live demo: build the frontend with the in-browser mock API (npm run build:demo), serve it with Caddy.
# Build context is the repo root (see docker-compose.yml). The full production stack is in fullstack/.
FROM node:22-alpine AS build
WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Public build-time settings (see frontend/src/config.ts). Empty keys = forms stay simulated.
ARG SITE_URL=""
ARG EMAILJS_PUBLIC_KEY=""
ARG EMAILJS_SERVICE_ID=""
ARG EMAILJS_TEMPLATE_EQUIPO=""
ARG EMAILJS_TEMPLATE_USUARIO=""
ENV VITE_SITE_URL=$SITE_URL \
    VITE_EMAILJS_PUBLIC_KEY=$EMAILJS_PUBLIC_KEY \
    VITE_EMAILJS_SERVICE_ID=$EMAILJS_SERVICE_ID \
    VITE_EMAILJS_TEMPLATE_EQUIPO=$EMAILJS_TEMPLATE_EQUIPO \
    VITE_EMAILJS_TEMPLATE_USUARIO=$EMAILJS_TEMPLATE_USUARIO
RUN npm run build:demo

FROM caddy:2.11-alpine
COPY --from=build /src/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
