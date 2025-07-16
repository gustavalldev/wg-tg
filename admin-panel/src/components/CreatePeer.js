import React, { useState } from 'react';
import { Plus, Download, Copy } from 'lucide-react';
import axios from 'axios';

const CreatePeer = () => {
  const [formData, setFormData] = useState({
    name: '',
    ip: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdPeer, setCreatedPeer] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateIP = () => {
    // Простая генерация IP в диапазоне 10.8.0.2 - 10.8.0.254
    const randomIP = Math.floor(Math.random() * 253) + 2;
    setFormData(prev => ({
      ...prev,
      ip: `10.8.0.${randomIP}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ip) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/peers', formData);
      setCreatedPeer(response.data);
      setFormData({ name: '', ip: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания peer\'а');
      console.error('Ошибка создания:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadConfig = () => {
    if (!createdPeer) return;

    const blob = new Blob([createdPeer.config], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdPeer.name}.conf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const copyConfig = () => {
    if (!createdPeer) return;
    
    navigator.clipboard.writeText(createdPeer.config).then(() => {
      alert('Конфигурация скопирована в буфер обмена');
    }).catch(() => {
      alert('Ошибка копирования');
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Создать Peer</h1>
        <p className="text-gray-600 mt-2">Добавить нового VPN клиента</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма создания */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Новый Peer</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Имя Peer'а
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="например: user1"
                required
              />
            </div>

            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-2">
                IP Адрес
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="ip"
                  name="ip"
                  value={formData.ip}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10.8.0.2"
                  required
                />
                <button
                  type="button"
                  onClick={generateIP}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Авто
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать Peer
                </>
              )}
            </button>
          </form>
        </div>

        {/* Результат создания */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Результат</h2>
          
          {createdPeer ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <strong>Peer успешно создан!</strong>
                <div className="mt-2 text-sm">
                  <div>Имя: {createdPeer.name}</div>
                  <div>IP: {createdPeer.ip}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Конфигурация:</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                    {createdPeer.config}
                  </pre>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={downloadConfig}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </button>
                  <button
                    onClick={copyConfig}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Создайте peer для получения конфигурации</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePeer; 