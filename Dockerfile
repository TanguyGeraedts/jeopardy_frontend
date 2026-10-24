# Jeopardy frontend (Next.js, standalone output).
# Build: docker build --build-arg BACKEND_URL=http://jeopardy-backend:8080 -t jeopardy-frontend .
#
# BACKEND_URL is where this server forwards /api/* (the Spring backend, as seen from this container).
# It is baked in at build time, so changing it means rebuilding the image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG BACKEND_URL=http://jeopardy-backend:8080
ENV BACKEND_URL=$BACKEND_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
