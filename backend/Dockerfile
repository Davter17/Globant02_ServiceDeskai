# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Development stage
FROM base AS development
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start in development mode
CMD ["npm", "run", "dev"]

# Builder stage for production
FROM base AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS production
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs && \
    chown -R expressjs:nodejs /app

USER expressjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
