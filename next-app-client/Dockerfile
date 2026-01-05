# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm và dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Copy .env.production (được tạo bởi CI/CD từ GitHub Secret)
# Next.js sẽ tự động đọc file này khi build
# File này chứa tất cả NEXT_PUBLIC_* variables

# Build Next.js app
RUN pnpm build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built app từ builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy next.config.ts
COPY next.config.ts ./

# Set Node.js memory limit to prevent OOM crash (4GB for 8GB RAM system)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start Next.js server
CMD ["pnpm", "start"]

