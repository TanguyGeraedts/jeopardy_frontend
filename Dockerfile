# Jeopardy frontend (Next.js, standalone output).
# Build:
#   docker build --build-arg BACKEND_URL=http://jeopardy-backend:8080 \
#                --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... -t jeopardy-frontend .
# Run with the secret key as an environment variable (never as a build arg: it would end up in the image):
#   docker run -e CLERK_SECRET_KEY=sk_live_... -p 3000:3000 jeopardy-frontend
#
# BACKEND_URL (where /api/* is forwarded) and the publishable key are baked in at build time.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG BACKEND_URL=http://jeopardy-backend:8080
# Public by design (it's in every page), so a build arg is fine. Required: Clerk can't render without it.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
RUN test -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" || (echo "Pass --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_..." && exit 1)
ENV BACKEND_URL=$BACKEND_URL NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
