# ==========================================
# Backend Dockerfile - Node.js + TypeScript
# Multi-stage build để giảm image size
# ==========================================

# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Cài dependencies trước (tận dụng Docker cache layer)
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source và build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine AS production

WORKDIR /app

# Cài chỉ production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy build output từ stage 1
COPY --from=builder /app/dist ./dist
# Copy file sql và dữ liệu khởi tạo
COPY --from=builder /app/src/config/init_postgres.sql ./dist/config/init_postgres.sql
COPY --from=builder /app/src/data/members.json ./dist/data/members.json

# Thư mục uploads cho avatars và thumbnails
RUN mkdir -p /app/uploads/avatars /app/uploads/thumbnails

# Non-root user để bảo mật
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
