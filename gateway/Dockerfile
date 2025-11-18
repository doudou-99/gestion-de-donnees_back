FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and prisma schema
COPY gateway/package*.json ./
COPY gateway/prisma ./prisma
COPY gateway/init-db.sh ./

# Install all dependencies (including devDependencies)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Make init script executable
RUN chmod +x init-db.sh

# Expose port
EXPOSE 3000

# Debug port
EXPOSE 9229

# Start in development mode (will be overridden by docker-compose command)
CMD ["npm", "run", "start:dev"]