# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set environment variables (these can be overridden by your deployment platform)
ENV NODE_ENV=production
ENV DB_USER=neondb_owner
ENV DB_PASSWORD=npg_e4WPqoNbdC2s
ENV DB_HOST=ep-lively-firefly-a2bmasqy.eu-central-1.aws.neon.tech
ENV DB_NAME=neondb
ENV DB_PORT=5432

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]