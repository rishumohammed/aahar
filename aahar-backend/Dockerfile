FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy remaining files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# We need mysql2 for the startup script connection check
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY start.sh ./start.sh

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3001

CMD ["./start.sh"]
