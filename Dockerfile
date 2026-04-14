# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy root configurations
COPY package*.json ./

# Copy backend
COPY backend/package*.json backend/
RUN cd backend && npm install --production

# Copy frontend
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

# Bundle app source
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 8080

# Start command
ENV NODE_ENV=production
ENV PORT=8080
CMD ["node", "backend/server.js"]
