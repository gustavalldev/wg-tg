#!/bin/bash

# WireGuard Server Setup Script
# Для Ubuntu 20.04
# IP: 109.107.170.233

set -e

echo "🚀 Настройка WireGuard сервера..."
echo "IP: 109.107.170.233"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка root прав
if [[ $EUID -ne 0 ]]; then
   print_error "Этот скрипт должен быть запущен от root"
   exit 1
fi

# Обновление системы
print_status "Обновление системы..."
apt update && apt upgrade -y

# Установка WireGuard
print_status "Установка WireGuard..."
apt install wireguard -y

# Включение IP forwarding
print_status "Настройка IP forwarding..."
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
sysctl -p

# Создание директорий
print_status "Создание директорий..."
mkdir -p /etc/wireguard
mkdir -p /var/lib/wireguard

# Генерация ключей сервера
print_status "Генерация ключей сервера..."
cd /etc/wireguard
wg genkey | tee server_private.key | wg pubkey > server_public.key

# Получение ключей
SERVER_PRIVATE_KEY=$(cat server_private.key)
SERVER_PUBLIC_KEY=$(cat server_public.key)

# Создание конфигурации сервера
print_status "Создание конфигурации сервера..."
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $SERVER_PRIVATE_KEY
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = true
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Серверный peer (для API)
[Peer]
# server
PublicKey = $SERVER_PUBLIC_KEY
AllowedIPs = 10.8.0.1/32
EOF

# Установка прав на конфигурацию
chmod 600 /etc/wireguard/wg0.conf

# Настройка файрвола
print_status "Настройка файрвола..."
ufw allow 51820/udp
ufw allow ssh
ufw --force enable

# Запуск WireGuard
print_status "Запуск WireGuard..."
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Проверка статуса
print_status "Проверка статуса WireGuard..."
if systemctl is-active --quiet wg-quick@wg0; then
    print_status "WireGuard успешно запущен!"
else
    print_error "Ошибка запуска WireGuard"
    exit 1
fi

# Создание тестового клиента
print_status "Создание тестового клиента..."
CLIENT_PRIVATE_KEY=$(wg genkey)
CLIENT_PUBLIC_KEY=$(echo $CLIENT_PRIVATE_KEY | wg pubkey)

# Добавление клиента в серверный конфиг
cat >> /etc/wg0.conf << EOF

# Тестовый клиент
[Peer]
# test_client
PublicKey = $CLIENT_PUBLIC_KEY
AllowedIPs = 10.8.0.2/32
EOF

# Создание клиентского конфига
cat > /root/test_client.conf << EOF
[Interface]
PrivateKey = $CLIENT_PRIVATE_KEY
Address = 10.8.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = 109.107.170.233:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF

# Перезапуск WireGuard для применения изменений
systemctl restart wg-quick@wg0

# Установка дополнительных инструментов
print_status "Установка дополнительных инструментов..."
apt install -y jq curl

# Создание скрипта для управления peer'ами
print_status "Создание скрипта управления peer'ами..."
cat > /usr/local/bin/wg-manager.sh << 'EOF'
#!/bin/bash

WG_INTERFACE="wg0"
WG_CONFIG="/etc/wireguard/${WG_INTERFACE}.conf"
WG_DATA_DIR="/var/lib/wireguard"

# Создание peer
create_peer() {
    local name=$1
    local ip=$2
    
    echo "Создаю peer: $name с IP: $ip"
    
    # Генерируем ключи
    local private_key=$(wg genkey)
    local public_key=$(echo "$private_key" | wg pubkey)
    
    # Создаём конфиг для клиента
    local client_config="[Interface]
PrivateKey = $private_key
Address = $ip/32
DNS = 1.1.1.1

[Peer]
PublicKey = $(wg show $WG_INTERFACE public-key)
Endpoint = 109.107.170.233:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25"
    
    # Добавляем peer в серверный конфиг
    echo "
[Peer]
# $name
PublicKey = $public_key
AllowedIPs = $ip/32" >> "$WG_CONFIG"
    
    # Сохраняем данные peer'а
    mkdir -p "$WG_DATA_DIR"
    echo "{\"name\":\"$name\",\"ip\":\"$ip\",\"public_key\":\"$public_key\",\"private_key\":\"$private_key\"}" > "$WG_DATA_DIR/$name.json"
    
    # Перезагружаем WireGuard
    wg syncconf $WG_INTERFACE <(wg-quick strip $WG_INTERFACE)
    
    echo "$client_config"
}

# Удаление peer
remove_peer() {
    local name=$1
    
    echo "Удаляю peer: $name"
    
    if [ -f "$WG_DATA_DIR/$name.json" ]; then
        local public_key=$(jq -r '.public_key' "$WG_DATA_DIR/$name.json")
        
        # Удаляем peer из конфига
        sed -i "/# $name/,/PublicKey = $public_key/,/AllowedIPs = .*\/32/d" "$WG_CONFIG"
        
        # Удаляем peer из WireGuard
        wg set $WG_INTERFACE peer "$public_key" remove
        
        # Удаляем файл данных
        rm -f "$WG_DATA_DIR/$name.json"
        
        echo "Peer $name удалён"
    else
        echo "Peer $name не найден"
        exit 1
    fi
}

# Получение конфига peer'а
get_peer_config() {
    local name=$1
    
    if [ -f "$WG_DATA_DIR/$name.json" ]; then
        local private_key=$(jq -r '.private_key' "$WG_DATA_DIR/$name.json")
        local ip=$(jq -r '.ip' "$WG_DATA_DIR/$name.json")
        
        echo "[Interface]
PrivateKey = $private_key
Address = $ip/32
DNS = 1.1.1.1

[Peer]
PublicKey = $(wg show $WG_INTERFACE public-key)
Endpoint = 109.107.170.233:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25"
    else
        echo "Peer $name не найден"
        exit 1
    fi
}

# Список всех peer'ов
list_peers() {
    echo "Список peer'ов:"
    if [ -d "$WG_DATA_DIR" ]; then
        for file in "$WG_DATA_DIR"/*.json; do
            if [ -f "$file" ]; then
                local name=$(basename "$file" .json)
                local ip=$(jq -r '.ip' "$file")
                echo "- $name ($ip)"
            fi
        done
    fi
}

# Основная логика
case "$1" in
    "create")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Использование: $0 create <name> <ip>"
            exit 1
        fi
        create_peer "$2" "$3"
        ;;
    "remove")
        if [ -z "$2" ]; then
            echo "Использование: $0 remove <name>"
            exit 1
        fi
        remove_peer "$2"
        ;;
    "config")
        if [ -z "$2" ]; then
            echo "Использование: $0 config <name>"
            exit 1
        fi
        get_peer_config "$2"
        ;;
    "list")
        list_peers
        ;;
    *)
        echo "Использование: $0 {create|remove|config|list}"
        echo "  create <name> <ip> - создать peer"
        echo "  remove <name>      - удалить peer"
        echo "  config <name>      - получить конфиг peer'а"
        echo "  list               - список всех peer'ов"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/wg-manager.sh

# Создание информации о сервере
print_status "Создание информации о сервере..."
cat > /root/server_info.txt << EOF
=== WireGuard Server Information ===
Server IP: 109.107.170.233
Server Port: 51820
Server Public Key: $SERVER_PUBLIC_KEY
Interface: wg0
Subnet: 10.8.0.0/24

=== Команды управления ===
Статус: wg show
Перезапуск: systemctl restart wg-quick@wg0
Логи: journalctl -u wg-quick@wg0

=== Скрипт управления ===
Создать peer: /usr/local/bin/wg-manager.sh create <name> <ip>
Удалить peer: /usr/local/bin/wg-manager.sh remove <name>
Список peer'ов: /usr/local/bin/wg-manager.sh list
Получить конфиг: /usr/local/bin/wg-manager.sh config <name>

=== Тестовый клиент ===
Файл: /root/test_client.conf
IP: 10.8.0.2
EOF

# Финальная проверка
print_status "Финальная проверка..."
echo ""
echo "=== Статус WireGuard ==="
wg show
echo ""
echo "=== Информация о сервере ==="
cat /root/server_info.txt
echo ""
print_status "Настройка завершена!"
print_status "Тестовый клиент: /root/test_client.conf"
print_warning "Не забудьте скачать test_client.conf и протестировать подключение!" 