FROM node:18-alpine

WORKDIR /app

# Устанавливаем необходимые пакеты
RUN apk add --no-cache bash jq

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем код приложения
COPY . .

EXPOSE 3000

CMD ["node", "server.js"] 