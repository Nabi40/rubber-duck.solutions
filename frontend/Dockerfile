# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets (VERY IMPORTANT)
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
