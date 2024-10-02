# Use the Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and rebuild native modules for the container's architecture
RUN npm install

# Copy all files to the container
COPY . .

# Rebuild bcrypt for the current architecture
RUN npm rebuild bcrypt

# Expose the application port
EXPOSE 5000

# Start the application using ts-node
CMD ["npm", "start"]
