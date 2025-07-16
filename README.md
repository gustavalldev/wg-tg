# VPN Bot with Admin Panel

🚀 **Telegram бот для управления WireGuard VPN с веб-админ-панелью**

Полноценная система управления VPN-доступом через Telegram бота с современной веб-панелью администратора.

## 📋 Содержание

- [Возможности](#-возможности)
- [Архитектура](#-архитектура)
- [Быстрый старт](#-быстрый-старт)
- [Настройка](#-настройка)
- [Использование](#-использование)
- [Деплой](#-деплой)
- [Разработка](#-разработка)

## ✨ Возможности

### 🤖 Telegram Bot
- Создание VPN профилей через команды
- Автоматическая генерация конфигураций
- Удаление профилей
- Проверка статуса сервера

### 🖥️ Admin Panel
- Современный веб-интерфейс
- Управление peer'ами
- Статистика подключений
- Создание/удаление клиентов
- Скачивание конфигураций

### 🔧 API
- REST API для управления WireGuard
- Bash скрипты для работы с конфигурациями
- Автоматическая генерация ключей

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Telegram Bot   │    │  Admin Panel    │    │  WireGuard API  │
│                 │    │                 │    │                 │
│  - /start       │    │  - Dashboard    │    │  - /api/peers   │
│  - /getvpn      │    │  - Peers List   │    │  - /health      │
│  - /remove      │    │  - Create Peer  │    │  - Bash Scripts │
│  - /status      │    │  - Statistics   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  WireGuard      │
                    │  Server         │
                    │                 │
                    │  - wg0          │
                    │  - Peer Configs │
                    │  - VPN Tunnel   │
                    └─────────────────┘
```

## 🚀 Быстрый старт

### Требования
- Docker и Docker Compose
- Telegram Bot Token
- WireGuard сервер (для продакшена)

### Локальный запуск

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/vpn-bot.git
cd vpn-bot
```

2. **Создайте файл .env:**
```bash
# Telegram Bot
TELEGRAM_TOKEN=your_bot_token_here

# Admin Panel (опционально)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

3. **Запустите через Docker:**
```bash
docker-compose up --build
```

4. **Откройте админ-панель:**
```
http://localhost:3001
```

## ⚙️ Настройка

### Telegram Bot

1. **Создайте бота через @BotFather:**
   - Напишите `/newbot`
   - Выберите имя и username
   - Получите токен

2. **Добавьте токен в .env:**
```bash
TELEGRAM_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Admin Panel

**Доступ по умолчанию:**
- Логин: `admin`
- Пароль: `admin123`

**Изменение через переменные:**
```bash
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

### WireGuard API

API автоматически настраивается при запуске контейнеров.

**Доступные эндпоинты:**
- `GET /health` - проверка статуса
- `GET /api/peers` - список peer'ов
- `POST /api/peers` - создание peer'а
- `DELETE /api/peers/:name` - удаление peer'а
- `GET /api/peers/:name/config` - конфигурация peer'а

## 📱 Использование

### Telegram Bot

**Команды:**
- `/start` - приветствие и инструкции
- `/getvpn` - создать VPN профиль
- `/remove` - удалить VPN профиль
- `/status` - проверить статус сервера

**Пример использования:**
```
Пользователь: /getvpn
Бот: 🔧 Генерирую peer и конфиг...
Бот: [Отправляет файл wg-user123.conf]
Бот: ✅ Ваш VPN-профиль готов!
```

### Admin Panel

**Страницы:**
- **Дашборд** - общая статистика
- **Peer'ы** - список всех клиентов
- **Создать Peer** - добавление новых клиентов
- **Статистика** - детальная аналитика

**Функции:**
- Просмотр всех peer'ов
- Создание новых клиентов
- Удаление peer'ов
- Скачивание конфигураций
- Мониторинг статистики

## 🌐 Деплой

### На одном сервере

1. **Подготовьте сервер:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose git

# Настройте WireGuard
sudo apt install wireguard
```

2. **Клонируйте проект:**
```bash
git clone https://github.com/your-username/vpn-bot.git
cd vpn-bot
```

3. **Настройте переменные:**
```bash
cp .env.example .env
# Отредактируйте .env с вашими данными
```

4. **Запустите:**
```bash
docker-compose up -d
```

### Разделение на серверы

**VPN Server:**
- Только WireGuard
- Порт 51820/UDP
- Публичный IP

**Control Server:**
- Telegram Bot
- Admin Panel
- API
- Порт 3000, 3001

## 🛠️ Разработка

### Структура проекта

```
vpn_bot/
├── bot/                    # Telegram бот
│   ├── bot.js
│   ├── package.json
│   └── Dockerfile
├── admin-panel/           # Веб-панель
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── wireguard-manager/     # API и скрипты
│   ├── api/
│   ├── scripts/
│   └── README.md
├── docker-compose.yml     # Оркестрация
├── .env.example          # Пример переменных
└── README.md             # Документация
```

### Локальная разработка

1. **Установите зависимости:**
```bash
# Bot
cd bot && npm install

# Admin Panel
cd admin-panel && npm install

# API
cd wireguard-manager/api && npm install
```

2. **Запустите компоненты:**
```bash
# Bot
cd bot && npm start

# Admin Panel
cd admin-panel && npm start

# API
cd wireguard-manager/api && npm start
```

### Переменные окружения

**Обязательные:**
- `TELEGRAM_TOKEN` - токен Telegram бота

**Опциональные:**
- `ADMIN_USERNAME` - логин админ-панели (по умолчанию: admin)
- `ADMIN_PASSWORD` - пароль админ-панели (по умолчанию: admin123)
- `WG_API_URL` - URL API (по умолчанию: http://localhost:3000)

## 🔒 Безопасность

### Рекомендации

1. **Измените пароли по умолчанию**
2. **Используйте HTTPS в продакшене**
3. **Настройте файрвол**
4. **Регулярно обновляйте зависимости**
5. **Мониторьте логи**

### Переменные для продакшена

```bash
# Обязательно измените в продакшене
TELEGRAM_TOKEN=your_real_bot_token
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password

# Дополнительно
NODE_ENV=production
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для фичи
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🆘 Поддержка

- **Issues:** [GitHub Issues](https://github.com/your-username/vpn-bot/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/vpn-bot/discussions)

---

⭐ **Если проект вам понравился, поставьте звезду!** 