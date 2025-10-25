# Multi-stage build for Railway deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY railway-backend/package*.json ./railway-backend/

# Install dependencies
RUN npm install
RUN cd railway-backend && npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY railway-backend/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application and backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/railway-backend ./railway-backend

# Create data directory
RUN mkdir -p ./data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "railway-backend/server.js"]
