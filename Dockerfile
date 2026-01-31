FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

# Expose app port
EXPOSE 7000

# Run compiled app
CMD ["node", "dist/main.js"]
