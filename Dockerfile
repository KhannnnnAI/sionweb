FROM node:20-slim

WORKDIR /usr/src/app

# Copy package files from functions directory
COPY functions/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the functions code
COPY functions/ ./

# Expose port cho Cloud Run
EXPOSE 8080

# Run the backend
CMD ["node", "index.js"]
