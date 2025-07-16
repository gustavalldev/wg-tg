import React, { useState, useEffect } from 'react';
import { Trash2, Download, RefreshCw, User } from 'lucide-react';
import axios from 'axios';

const PeersList = () => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/peers');
      setPeers(response.data.peers || []);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки списка peer\'ов');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePeer = async (name) => {
    if (!window.confirm(`Удалить peer "${name}"?`)) return;

    try {
      await axios.delete(`/api/peers/${name}`);
      setPeers(peers.filter(peer => peer.name !== name));
    } catch (err) {
      alert('Ошибка при удалении peer\'а');
      console.error('Ошибка удаления:', err);
    }
  };

  const downloadConfig = async (name) => {
    try {
      const response = await axios.get(`/api/peers/${name}/config`, {
        responseType: 'text'
      });
      
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.conf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Ошибка при скачивании конфига');
      console.error('Ошибка скачивания:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Peer'ы</h1>
          <p className="text-gray-600 mt-2">Управление VPN клиентами</p>
        </div>
        <button
          onClick={fetchPeers}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {peers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет peer'ов</h3>
          <p className="text-gray-600">Создайте первый peer для начала работы</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Всего peer'ов: {peers.length}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Адрес
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {peers.map((peer) => (
                  <tr key={peer.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {peer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {peer.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Активен
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => downloadConfig(peer.name)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Скачать конфиг"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePeer(peer.name)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Удалить peer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeersList; 