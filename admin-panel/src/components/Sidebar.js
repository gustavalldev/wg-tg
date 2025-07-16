import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Plus, 
  BarChart3, 
  Shield,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const username = localStorage.getItem('adminUsername') || 'Admin';

  const menuItems = [
    { path: '/', icon: Home, label: 'Дашборд' },
    { path: '/peers', icon: Users, label: 'Peer\'ы' },
    { path: '/create', icon: Plus, label: 'Создать Peer' },
    { path: '/statistics', icon: BarChart3, label: 'Статистика' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">VPN Admin</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Пользователь и выход */}
      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">{username}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Выйти"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 