import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, Users } from 'lucide-react';
import axios from 'axios';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalPeers: 0,
    activeConnections: 0,
    totalTraffic: '0 MB',
    uptime: '0 дней'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/peers');
      const peers = response.data.peers || [];
      
      setStats({
        totalPeers: peers.length,
        activeConnections: peers.length, // Пока считаем все активными
        totalTraffic: '0 MB', // Пока не реализовано
        uptime: '1 день' // Пока не реализовано
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : value}
          </p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Статистика</h1>
        <p className="text-gray-600 mt-2">Аналитика и мониторинг VPN сервера</p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Всего Peer'ов"
          value={stats.totalPeers}
          description="Зарегистрированных клиентов"
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          title="Активные подключения"
          value={stats.activeConnections}
          description="Сейчас онлайн"
          color="bg-green-500"
        />
        <StatCard
          icon={BarChart3}
          title="Общий трафик"
          value={stats.totalTraffic}
          description="За всё время"
          color="bg-purple-500"
        />
        <StatCard
          icon={Clock}
          title="Время работы"
          value={stats.uptime}
          description="Сервера"
          color="bg-orange-500"
        />
      </div>

      {/* Графики и детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* График подключений */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Подключения по времени</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>График подключений</p>
              <p className="text-sm">(Будет реализован позже)</p>
            </div>
          </div>
        </div>

        {/* Топ peer'ов по трафику */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ по трафику</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">user1</span>
              </div>
              <span className="text-sm text-gray-600">0 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">user2</span>
              </div>
              <span className="text-sm text-gray-600">0 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">user3</span>
              </div>
              <span className="text-sm text-gray-600">0 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Системная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Сервер</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>ОС: Linux</div>
              <div>Версия: Ubuntu 20.04</div>
              <div>Процессор: 2 vCPU</div>
              <div>Память: 4 GB</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">WireGuard</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Версия: 1.0.20210914</div>
              <div>Интерфейс: wg0</div>
              <div>Порт: 51820</div>
              <div>Статус: Активен</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Сеть</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Подсеть: 10.8.0.0/24</div>
              <div>DNS: 1.1.1.1</div>
              <div>MTU: 1420</div>
              <div>Keepalive: 25s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 