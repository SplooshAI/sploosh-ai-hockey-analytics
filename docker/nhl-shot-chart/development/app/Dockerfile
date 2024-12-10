FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG GIT_HASH=unknown
ENV NEXT_PUBLIC_GIT_HASH=$GIT_HASH
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Debug environment variables
RUN echo "Git Hash: $NEXT_PUBLIC_GIT_HASH"
RUN echo "NEXT_PUBLIC_GIT_HASH: $NEXT_PUBLIC_GIT_HASH"

EXPOSE 3000

CMD ["npm", "run", "dev"]

