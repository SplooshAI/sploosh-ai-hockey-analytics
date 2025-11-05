FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Clean install
RUN npm ci

# Now copy the rest of the app
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Add build info
ARG GIT_HASH=unknown
ARG GIT_DATE=unknown
ENV NEXT_PUBLIC_GIT_HASH=$GIT_HASH
ENV NEXT_PUBLIC_GIT_DATE=$GIT_DATE

EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
