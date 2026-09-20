# ==========================================
# Frontend Dockerfile - React + Vite + Nginx
# Multi-stage: Build React → Serve bằng Nginx
# ==========================================

# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Nginx để serve static files
FROM nginx:alpine AS production

# Ngăn ngừa lỗi treo khi khởi động do apk manifest trong script ipv6 mặc định của nginx:alpine
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

# Copy Nginx config tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
