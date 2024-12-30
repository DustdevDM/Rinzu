# Use the official Node.js image as the build stage
FROM node:lts AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install typescript -g

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Use the official Node.js image for the runtime stage
FROM node:lts

# Install Chrome
RUN apt update && \
    apt install -y wget which && \
    wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Set the working directory
WORKDIR /app

# Copy dependencies and compiled code from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/out ./

# Command to run the application
CMD ["node", "index.js"]
