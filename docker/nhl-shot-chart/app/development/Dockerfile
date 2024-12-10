# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Development specific settings
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"] 