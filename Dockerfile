FROM node:20-alpine AS frontend_builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/. .
RUN npm run build

FROM node:20-alpine AS backend_deps
WORKDIR /backend
COPY backend/package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS backend_builder
WORKDIR /backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/. .
RUN npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /srv
RUN apk add --no-cache nginx supervisor curl
RUN mkdir -p /var/log/supervisor /run/nginx /srv/backend

# Frontend
COPY --from=frontend_builder /frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Backend
WORKDIR /srv/backend
COPY --from=backend_deps /backend/node_modules ./node_modules
COPY --from=backend_builder /backend/dist ./dist
COPY backend/package*.json ./

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -sf http://127.0.0.1/ || exit 1
COPY supervisord.conf /etc/supervisord.conf
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
