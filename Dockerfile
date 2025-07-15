# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose your app port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
