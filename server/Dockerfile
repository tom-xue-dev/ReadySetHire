# Use Node.js 18 with Debian base for better compatibility with native modules
FROM node:18-slim

# Install system dependencies needed for ONNX Runtime and other native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code (excluding test files)
COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Remove dev dependencies after build (but keep prisma for migrations)
RUN npm prune --production
RUN npm install prisma --save

# Copy and setup startup script (before switching to non-root user)
COPY docker-startup.sh /app/docker-startup.sh
RUN chmod +x /app/docker-startup.sh

# Create non-root user for security (Debian syntax)
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with full database setup
CMD ["/app/docker-startup.sh"]
