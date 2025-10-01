import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ChevronRight, Users, Calendar, Award, LogIn, LogOut, 
  Menu, X, TrendingUp, Clock, Building2, 
  Sun, Moon, Shield, UserCheck, Settings,
  BarChart3, FileText, Bell, Search, Filter,
  Plus, Edit, Trash2, Eye, CheckCircle, XCircle,
  Activity, PieChart, List, Home
} from 'lucide-react';

// Константы
const API_URL = 'http://localhost:8000/api';

// Контексты
const ThemeContext = createContext();
const AuthContext = createContext();

// Хуки
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Провайдеры
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#ffffff';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Страница статистики
const StatsPage = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const periods = {
    week: 'Неделя',
    month: 'Месяц', 
    quarter: 'Квартал',
    year: 'Год'
  };

  const attendanceData = [
    { party: 'Единая Россия', attendance: 94, color: '#1976d2' },
    { party: 'КПРФ', attendance: 91, color: '#d32f2f' },
    { party: 'ЛДПР', attendance: 87, color: '#f57c00' },
    { party: 'Справедливая Россия', attendance: 83, color: '#388e3c' }
  ];

  const votingStats = {
    totalVotes: 156,
    unanimousVotes: 23,
    majorityVotes: 108,
    closeVotes: 25
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Статистика работы парламента
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Аналитика деятельности Государственной Думы
          </p>
        </div>

        {/* Период */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {Object.entries(periods).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedPeriod === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">{votingStats.totalVotes}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Всего голосований
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{votingStats.unanimousVotes}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Единогласных решений
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">87.3%</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Средняя явка
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">425</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Активных депутатов
            </h3>
          </div>
        </div>

        {/* Посещаемость по партиям */}
        <div className={`${
          theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
        } rounded-xl p-6 mb-8`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Посещаемость по партиям
          </h2>
          <div className="space-y-4">
            {attendanceData.map((party, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {party.party}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-32 h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${party.attendance}%`,
                        backgroundColor: party.color
                      }}
                    ></div>
                  </div>
                  <span className={`font-bold w-12 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {party.attendance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Голосования */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Результаты голосований
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Большинством голосов
                </span>
                <span className="font-bold text-blue-500">{votingStats.majorityVotes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Единогласно
                </span>
                

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Тестовые пользователи
      const testUsers = {
        'admin': { username: 'admin', user_type: 'admin', password: 'admin' },
        'deputy1': { username: 'deputy1', user_type: 'deputy', password: 'deputy1' }
      };

      const testUser = testUsers[username];
      if (testUser && testUser.password === password) {
        setUser(testUser);
        setToken('fake-token');
        return { success: true };
      }
      return { success: false, error: 'Неверный логин или пароль' };
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Компонент навигации
const Navigation = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getUserIcon = () => {
    if (user?.user_type === 'admin') return <Shield className="h-5 w-5 text-yellow-400" />;
    if (user?.user_type === 'deputy') return <UserCheck className="h-5 w-5 text-blue-400" />;
    return null;
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/95 backdrop-blur-md shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentView('main')}
                className="flex items-center"
              >
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <span className={`ml-3 text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Парламент РФ
                </span>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('main')}
                className={`hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'main' ? 'text-blue-500 font-medium' : ''}`}
              >
                Главная
              </button>
              
              <button
                onClick={() => setCurrentView('deputies')}
                className={`hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'deputies' ? 'text-blue-500 font-medium' : ''}`}
              >
                Депутаты
              </button>
              
              <button
                onClick={() => setCurrentView('sessions')}
                className={`hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'sessions' ? 'text-blue-500 font-medium' : ''}`}
              >
                Заседания
              </button>
              
              <button
                onClick={() => setCurrentView('parties')}
                className={`hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'parties' ? 'text-blue-500 font-medium' : ''}`}
              >
                Партии
              </button>
              
              <button
                onClick={() => setCurrentView('stats')}
                className={`hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'stats' ? 'text-blue-500 font-medium' : ''}`}
              >
                Статистика
              </button>

              {user?.user_type === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center space-x-2 hover:text-blue-500 transition ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } ${currentView === 'admin' ? 'text-blue-500 font-medium' : ''}`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Админ панель</span>
                </button>
              )}
              
              {user?.user_type === 'deputy' && (
                <button
                  onClick={() => setCurrentView('deputy')}
                  className={`flex items-center space-x-2 hover:text-blue-500 transition ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } ${currentView === 'deputy' ? 'text-blue-500 font-medium' : ''}`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Личный кабинет</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/10'
                  } backdrop-blur`}>
                    {getUserIcon()}
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {user.username}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Выход</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Вход</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <LoginModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

// Модальное окно входа
const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(formData.username, formData.password);
    
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Невеверный логин или пароль');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
      } rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all`}>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Вход в систему</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            Введите ваши учетные данные
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            Тест: admin/admin или deputy1/deputy1
          </p>
        </div>
        
        {error && (
          <div className={`mb-4 p-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-red-900/30 border border-red-600 text-red-400' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-300 bg-white'
            }`}
            required
          />
          
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-300 bg-white'
            }`}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Вход...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>
        
        <button
          onClick={onClose}
          className={`mt-4 w-full ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

// Главная страница
const MainPage = () => {
  const { theme } = useTheme();
  const [statistics, setStatistics] = useState({
    totalDeputies: 450,
    activeDeputies: 425,
    totalParties: 14,
    totalSessions: 156,
    averageAttendance: 87.3
  });

  const [recentDeputies, setRecentDeputies] = useState([
    { id: 1, name: 'Иванов Иван Иванович', party: 'Единая Россия', attendance: 95, color: '#1976d2' },
    { id: 2, name: 'Петров Петр Петрович', party: 'КПРФ', attendance: 88, color: '#d32f2f' },
    { id: 3, name: 'Сидорова Анна Сергеевна', party: 'ЛДПР', attendance: 92, color: '#f57c00' }
  ]);

  const [recentSessions, setRecentSessions] = useState([
    { id: 1, title: 'Пленарное заседание №234', date: '2025-01-25', type: 'plenary', attendance: 92 },
    { id: 2, title: 'Комитет по бюджету', date: '2025-01-24', type: 'committee', attendance: 87 },
    { id: 3, title: 'Рабочая группа по законопроекту', date: '2025-01-23', type: 'working_group', attendance: 78 }
  ]);

  const [parties, setParties] = useState([
    { id: 1, name: 'Единая Россия', color: '#1976d2', members: 324 },
    { id: 2, name: 'КПРФ', color: '#d32f2f', members: 57 },
    { id: 3, name: 'ЛДПР', color: '#f57c00', members: 39 },
    { id: 4, name: 'Справедливая Россия', color: '#388e3c', members: 23 }
  ]);

  const StatsCard = ({ icon: Icon, title, value, change, gradient }) => (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
        : 'bg-white shadow-lg'
    } rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-bold ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>
        {title}
      </h3>
      <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Парламент
              <span className="block text-3xl md:text-5xl mt-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Российской Федерации
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Полная информация о депутатах, заседаниях, голосованиях и статистике работы парламента
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={Users} 
              title="Всего депутатов" 
              value={statistics.activeDeputies}
              gradient="from-blue-500 to-blue-600"
            />
            <StatsCard 
              icon={Building2} 
              title="Партий" 
              value={statistics.totalParties}
              gradient="from-green-500 to-green-600"
            />
            <StatsCard 
              icon={Calendar} 
              title="Заседаний проведено" 
              value={statistics.totalSessions}
              gradient="from-purple-500 to-purple-600"
            />
            <StatsCard 
              icon={TrendingUp} 
              title="Средняя явка" 
              value={`${statistics.averageAttendance}%`}
              change={2.3}
              gradient="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Deputies Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Депутаты
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Информация о народных избранниках
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDeputies.map(deputy => (
              <div key={deputy.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: deputy.color }}>
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {deputy.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {deputy.party}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Посещаемость:
                      </span>
                      <span className="font-bold text-green-500">
                        {deputy.attendance}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Последние заседания
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Информация о проведенных заседаниях
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSessions.map(session => (
              <div key={session.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                  {session.title}
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{new Date(session.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Явка:
                    </span>
                    <span className="font-bold text-green-500">{session.attendance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parties Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Политические партии
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Партии представленные в парламенте
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {parties.map(party => (
              <div key={party.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center`}>
                <div className="w-16 h-16 mx-auto rounded-full mb-4" style={{ backgroundColor: party.color }}></div>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {party.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Депутатов: <span className="font-bold">{party.members}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Страница депутатов
const DeputiesPage = () => {
  const { theme } = useTheme();
  const [deputies, setDeputies] = useState([
    { id: 1, name: 'Иванов Иван Иванович', party: 'Единая Россия', district: 'Московский округ №1', attendance: 95, color: '#1976d2' },
    { id: 2, name: 'Петров Петр Петрович', party: 'КПРФ', district: 'Санкт-Петербургский округ №5', attendance: 88, color: '#d32f2f' },
    { id: 3, name: 'Сидорова Анна Сергеевна', party: 'ЛДПР', district: 'Нижегородский округ №3', attendance: 92, color: '#f57c00' },
    { id: 4, name: 'Козлов Александр Владимирович', party: 'Справедливая Россия', district: 'Казанский округ №2', attendance: 79, color: '#388e3c' },
    { id: 5, name: 'Николаева Елена Павловна', party: 'Единая Россия', district: 'Екатеринбургский округ №7', attendance: 91, color: '#1976d2' }