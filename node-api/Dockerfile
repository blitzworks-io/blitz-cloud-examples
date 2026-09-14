# Install dependencies in a throwaway stage so the final image has no npm cache.
FROM node:22.23.2-alpine3.24 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22.23.2-alpine3.24
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
# The official Node image ships a "node" user with uid 1000, the same uid
# blitz.cloud runs every app as.
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
