# Build stage: turn the Astro project into plain files in dist/.
FROM node:22.23.2-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage: nginx without root, listening on 8080.
FROM nginxinc/nginx-unprivileged:1.30.4-alpine3.24
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# blitz.cloud runs every app as uid 1000. nginx-unprivileged keeps its pid
# file and temp folders in /tmp, which any uid can write to.
USER 1000
EXPOSE 8080
