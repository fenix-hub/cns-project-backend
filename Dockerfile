FROM node:20-alpine AS node


# Builder stage

FROM node AS builder

# Use /app as the CWD
WORKDIR /app            

# Copy package.json and package-lock.json to /app
COPY package*.json ./   

# Install all dependencies
RUN npm i --only=production

# Copy the rest of the code
COPY . .


# Final stage

FROM node AS final

# Prepare destination directory and ensure user node owns it
RUN mkdir /home/node/app && chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app

# Switch to user node
USER node

# Copy js files and change ownership to user node
COPY --chown=node:node --from=builder /app ./app

# Open desired port
EXPOSE 3000 3001 1935

# Use js files to run the application
ENTRYPOINT ["node", "app.js"]
