# Dockerfile

# 1. Use a Node.js base image
FROM node:18

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy all source files
COPY . .

# 5. Expose port
EXPOSE 5000

# 6. Run the application
CMD ["npm", "start"]
