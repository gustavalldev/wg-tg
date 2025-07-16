import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, Download } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPeers: 0,
    activePeers: 0,
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
        activePeers: peers.length, // Пока считаем все активными
        totalTraffic: '0 MB', // Пока не реализовано
        uptime: '1 день' // Пока не реализовано
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600 mt-2">Обзор состояния VPN сервера</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Всего Peer'ов"
          value={stats.totalPeers}
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          title="Активные Peer'ы"
          value={stats.activePeers}
          color="bg-green-500"
        />
        <StatCard
          icon={Download}
          title="Общий трафик"
          value={stats.totalTraffic}
          color="bg-purple-500"
        />
        <StatCard
          icon={Shield}
          title="Время работы"
          value={stats.uptime}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Создать новый Peer
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
              Экспорт конфигурации
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              Перезапустить сервер
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус сервера</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WireGuard</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Активен
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Работает
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Telegram Bot</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Онлайн
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 