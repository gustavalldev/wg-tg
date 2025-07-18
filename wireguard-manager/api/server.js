const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://45.87.247.206:8080'
  }));

// Путь к скрипту
const WG_SCRIPT = '/app/scripts/wg-manager.sh';

// Функция для выполнения bash-команд
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Создание peer
app.post('/api/peers', async (req, res) => {
    try {
        const { name, ip } = req.body;
        
        if (!name || !ip) {
            return res.status(400).json({ error: 'Требуются name и ip' });
        }
        
        const command = `bash ${WG_SCRIPT} create "${name}" "${ip}"`;
        const config = await execCommand(command);
        
        res.json({
            success: true,
            name,
            ip,
            config
        });
    } catch (error) {
        console.error('Ошибка создания peer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Удаление peer
app.delete('/api/peers/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const command = `bash ${WG_SCRIPT} remove "${name}"`;
        await execCommand(command);
        
        res.json({ success: true, message: `Peer ${name} удалён` });
    } catch (error) {
        console.error('Ошибка удаления peer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получение конфига peer'а
app.get('/api/peers/:name/config', async (req, res) => {
    try {
        const { name } = req.params;
        
        const command = `bash ${WG_SCRIPT} config "${name}"`;
        const config = await execCommand(command);
        
        res.set('Content-Type', 'text/plain');
        res.send(config);
    } catch (error) {
        console.error('Ошибка получения конфига:', error);
        res.status(500).json({ error: error.message });
    }
});

// Список всех peer'ов
app.get('/api/peers', async (req, res) => {
    try {
        const command = `bash ${WG_SCRIPT} list`;
        const output = await execCommand(command);
        
        // Парсим вывод в JSON
        const peers = [];
        const lines = output.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('- ')) {
                const match = line.match(/- (.+) \((.+)\)/);
                if (match) {
                    peers.push({
                        name: match[1],
                        ip: match[2]
                    });
                }
            }
        }
        
        res.json({ peers });
    } catch (error) {
        console.error('Ошибка получения списка peer\'ов:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка здоровья API
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 WireGuard Manager API запущен на порту ${PORT}`);
    console.log(`📝 Скрипт: ${WG_SCRIPT}`);
});

module.exports = app; 