# Use Node.js LTS
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
# We need to handle both root (frontend) and backend deps if we were building here,
# but we are assuming pre-built dist for simplicity, OR we build inside.
# Let's do a clean build inside Docker for robustness.

# Copy everything
COPY . .

# Install and Build Frontend
RUN npm install
RUN npm run build

# Install Backend
WORKDIR /app/backend
RUN npm install

# Expose Port
EXPOSE 3000

# Start Server
# Set NODE_ENV to production so it serves static files
ENV NODE_ENV=production
CMD ["npm", "start"]
