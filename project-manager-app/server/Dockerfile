FROM node:18-alpine

# Update Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
