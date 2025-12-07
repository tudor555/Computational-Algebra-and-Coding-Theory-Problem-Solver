# Use an official Node.js image as a base
FROM node:24-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the application port
EXPOSE 4200

# Start the application using Angular and enable hot reload
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll=2000"]