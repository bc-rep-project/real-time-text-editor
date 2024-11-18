FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (if running in production)
RUN if [ "$NODE_ENV" = "production" ]; then npm run build && npm run build:server; fi

# Expose ports
EXPOSE 3000
EXPOSE 8080
EXPOSE 8081

# Start command will be provided by docker-compose
CMD ["npm", "run", "dev"] 