# Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN chown -R 1000:1000 /app

USER 1000

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=1000:1000 . .

ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000