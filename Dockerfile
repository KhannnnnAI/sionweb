FROM node:20-slim

WORKDIR /usr/src/app

# Copy package files from functions directory
COPY functions/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the functions code
COPY functions/ ./

# Run the backend
CMD ["node", "index.js"]
