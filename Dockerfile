# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy bot source files
COPY . .

# Expose any ports if your bot uses them (usually not needed for Discord bots)
# EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
