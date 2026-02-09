FROM node:20-slim

# Install LibreOffice for PDF conversion and other deps
RUN apt-get update && apt-get install -y \
    libreoffice \
    default-jre \
    fonts-liberation \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
