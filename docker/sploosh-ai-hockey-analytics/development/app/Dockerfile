FROM node:22-alpine
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Clean install
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install

# Now copy the rest of the app
COPY . .

ARG GIT_HASH=unknown
ARG GIT_DATE=unknown

ENV NEXT_PUBLIC_GIT_HASH=$GIT_HASH
ENV NEXT_PUBLIC_GIT_DATE=$GIT_DATE
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Debug environment variables
RUN echo "NEXT_PUBLIC_GIT_HASH: $NEXT_PUBLIC_GIT_HASH"
RUN echo "NEXT_PUBLIC_GIT_DATE: $NEXT_PUBLIC_GIT_DATE"

EXPOSE 3000

CMD ["npm", "run", "dev"]

