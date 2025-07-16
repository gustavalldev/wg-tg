FROM node:18-alpine as build

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение с переменными окружения
ARG REACT_APP_ADMIN_USERNAME=admin
ARG REACT_APP_ADMIN_PASSWORD=admin123
ARG REACT_APP_API_URL=http://localhost:3000

RUN npm run build

# Продакшн этап
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"] 