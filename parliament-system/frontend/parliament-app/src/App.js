import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ChevronRight, Users, Calendar, Award, LogIn, LogOut, 
  Menu, X, TrendingUp, Clock, Building2, 
  Sun, Moon, Shield, UserCheck, Settings,
  BarChart3, FileText, Bell, Search, Filter,
  Plus, Edit, Trash2, Eye, CheckCircle, XCircle,
  Activity, PieChart, List, Home, Save, AlertCircle
} from 'lucide-react';

// Контексты
const ThemeContext = createContext();
const AuthContext = createContext();
const DataContext = createContext();

// Хуки
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

// Провайдер темы
export const ThemeProvider = ({ children }) => {
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

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Провайдер аутентификации
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      return JSON.parse(savedAccounts);
    }
    return {
      'admin': { id: 1, username: 'admin', user_type: 'admin', password: 'Admin123!', name: 'Администратор' },
      'deputy1': { id: 2, username: 'deputy1', user_type: 'deputy', password: 'Deputy123!', name: 'Иванов И.И.', deputyId: 1 },
      'deputy2': { id: 3, username: 'deputy2', user_type: 'deputy', password: 'Deputy123!', name: 'Петров П.П.', deputyId: 2 }
    };
  });

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const testUser = accounts[username];
      
      const lockKey = `locked_${username}`;
      const attemptsKey = `attempts_${username}`;
      const lockUntil = parseInt(sessionStorage.getItem(lockKey) || '0');
      
      if (lockUntil > Date.now()) {
        const remainingSeconds = Math.ceil((lockUntil - Date.now()) / 1000);
        return { 
          success: false, 
          error: `Аккаунт заблокирован. Попробуйте через ${remainingSeconds} сек.` 
        };
      }
      
      if (testUser && testUser.password === password) {
        const { password: _, ...userWithoutPassword } = testUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        sessionStorage.removeItem(attemptsKey);
        return { success: true };
      }
      
      const attempts = parseInt(sessionStorage.getItem(attemptsKey) || '0') + 1;
      sessionStorage.setItem(attemptsKey, attempts.toString());
      
      if (attempts >= 5) {
        const lockTime = Date.now() + 60000;
        sessionStorage.setItem(lockKey, lockTime.toString());
        sessionStorage.removeItem(attemptsKey);
        return { 
          success: false, 
          error: 'Превышен лимит попыток входа. Аккаунт заблокирован на 1 минуту.' 
        };
      }
      
      return { 
        success: false, 
        error: `Неверный логин или пароль. Осталось попыток: ${5 - attempts}` 
      };
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const createAccount = (deputyId, username, password, deputyName) => {
    const newAccount = {
      id: Date.now(),
      username,
      password,
      user_type: 'deputy',
      name: deputyName,
      deputyId
    };
    setAccounts(prev => ({ ...prev, [username]: newAccount }));
  };

  const updateAccount = (username, newPassword) => {
    setAccounts(prev => ({
      ...prev,
      [username]: { ...prev[username], password: newPassword }
    }));
  };

  const deleteAccount = (username) => {
    if (username === 'admin') return;
    setAccounts(prev => {
      const newAccounts = { ...prev };
      delete newAccounts[username];
      return newAccounts;
    });
  };

  const getAccountByDeputyId = (deputyId) => {
    return Object.values(accounts).find(acc => acc.deputyId === deputyId);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      createAccount, 
      updateAccount, 
      deleteAccount,
      getAccountByDeputyId,
      accounts 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Провайдер данных
export const DataProvider = ({ children }) => {
  const [deputies, setDeputies] = useState([
    { id: 1, name: 'Иванов Иван Иванович', party: 'Единая Россия', district: 'Московский округ №1', attendance: 95, votes: 234, speeches: 12, email: 'ivanov@duma.ru', phone: '+7 (495) 123-45-67' },
    { id: 2, name: 'Петров Петр Петрович', party: 'КПРФ', district: 'Санкт-Петербургский округ №5', attendance: 88, votes: 210, speeches: 8, email: 'petrov@duma.ru', phone: '+7 (495) 234-56-78' },
    { id: 3, name: 'Сидорова Анна Сергеевна', party: 'ЛДПР', district: 'Нижегородский округ №3', attendance: 92, votes: 225, speeches: 15, email: 'sidorova@duma.ru', phone: '+7 (495) 345-67-89' },
    { id: 4, name: 'Козлов Александр Владимирович', party: 'Справедливая Россия', district: 'Казанский округ №2', attendance: 79, votes: 189, speeches: 5, email: 'kozlov@duma.ru', phone: '+7 (495) 456-78-90' },
    { id: 5, name: 'Николаева Елена Павловна', party: 'Единая Россия', district: 'Екатеринбургский округ №7', attendance: 91, votes: 218, speeches: 10, email: 'nikolaeva@duma.ru', phone: '+7 (495) 567-89-01' }
  ]);

  const [parties, setParties] = useState([
    { id: 1, name: 'Единая Россия', color: '#1976d2', members: 324, leader: 'Медведев Д.А.', founded: 2001 },
    { id: 2, name: 'КПРФ', color: '#d32f2f', members: 57, leader: 'Зюганов Г.А.', founded: 1993 },
    { id: 3, name: 'ЛДПР', color: '#f57c00', members: 39, leader: 'Слуцкий Л.Э.', founded: 1992 },
    { id: 4, name: 'Справедливая Россия', color: '#388e3c', members: 23, leader: 'Миронов С.М.', founded: 2006 },
    { id: 5, name: 'Новые люди', color: '#9c27b0', members: 7, leader: 'Нечаев А.Г.', founded: 2020 }
  ]);

  const [sessions, setSessions] = useState([
    { id: 1, title: 'Пленарное заседание №234', date: '2025-01-25', time: '10:00', type: 'plenary', status: 'completed', attendance: 80, agenda: ['Вопрос о бюджете', 'Законопроект №123', 'Отчет министра'], duration: 180, attendees: [1, 2, 3, 5] },
    { id: 2, title: 'Комитет по бюджету', date: '2025-01-24', time: '14:00', type: 'committee', status: 'completed', attendance: 60, agenda: ['Рассмотрение поправок'], duration: 120, attendees: [1, 2, 3] },
    { id: 3, title: 'Рабочая группа по законопроекту', date: '2025-01-23', time: '11:00', type: 'working_group', status: 'completed', attendance: 40, agenda: ['Обсуждение проекта'], duration: 90, attendees: [2, 4] },
    { id: 4, title: 'Пленарное заседание №235', date: '2025-01-28', time: '10:00', type: 'plenary', status: 'scheduled', attendance: 0, agenda: ['Новые законопроекты'], duration: 180, attendees: [] },
    { id: 5, title: 'Комитет по образованию', date: '2025-01-29', time: '15:00', type: 'committee', status: 'scheduled', attendance: 0, agenda: ['Реформа образования'], duration: 150, attendees: [] }
  ]);

  const addDeputy = (deputy) => {
    const newDeputy = { ...deputy, id: Date.now() };
    setDeputies([...deputies, newDeputy]);
  };

  const updateDeputy = (id, updatedDeputy) => {
    setDeputies(deputies.map(d => d.id === id ? { ...d, ...updatedDeputy } : d));
  };

  const deleteDeputy = (id) => {
    setDeputies(deputies.filter(d => d.id !== id));
  };

  const addParty = (party) => {
    const newParty = { ...party, id: Date.now() };
    setParties([...parties, newParty]);
  };

  const updateParty = (id, updatedParty) => {
    setParties(parties.map(p => p.id === id ? { ...p, ...updatedParty } : p));
  };

  const deleteParty = (id) => {
    setParties(parties.filter(p => p.id !== id));
  };

  const addSession = (session) => {
    const newSession = { ...session, id: Date.now(), status: 'scheduled', attendance: 0, attendees: [] };
    setSessions([...sessions, newSession]);
  };

  const updateSession = (id, updatedSession) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updatedSession } : s));
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider value={{
      deputies, parties, sessions,
      addDeputy, updateDeputy, deleteDeputy,
      addParty, updateParty, deleteParty,
      addSession, updateSession, deleteSession
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Компонент навигации
const Navigation = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/95 backdrop-blur-md shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => setCurrentView('main')} className="flex items-center">
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
              <button onClick={() => setCurrentView('main')} className={`hover:text-blue-500 transition ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              } ${currentView === 'main' ? 'text-blue-500 font-medium' : ''}`}>
                Главная
              </button>
              
              <button onClick={() => setCurrentView('deputies')} className={`hover:text-blue-500 transition ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              } ${currentView === 'deputies' ? 'text-blue-500 font-medium' : ''}`}>
                Депутаты
              </button>
              
              <button onClick={() => setCurrentView('sessions')} className={`hover:text-blue-500 transition ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              } ${currentView === 'sessions' ? 'text-blue-500 font-medium' : ''}`}>
                Заседания
              </button>
              
              <button onClick={() => setCurrentView('parties')} className={`hover:text-blue-500 transition ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              } ${currentView === 'parties' ? 'text-blue-500 font-medium' : ''}`}>
                Партии
              </button>
              
              <button onClick={() => setCurrentView('stats')} className={`hover:text-blue-500 transition ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              } ${currentView === 'stats' ? 'text-blue-500 font-medium' : ''}`}>
                Статистика
              </button>

              {user?.user_type === 'admin' && (
                <>
                  <button onClick={() => setCurrentView('admin')} className={`flex items-center space-x-2 hover:text-blue-500 transition ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } ${currentView === 'admin' ? 'text-blue-500 font-medium' : ''}`}>
                    <Settings className="h-5 w-5" />
                    <span>Админ</span>
                  </button>
                  <button onClick={() => setCurrentView('attendance')} className={`flex items-center space-x-2 hover:text-blue-500 transition ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } ${currentView === 'attendance' ? 'text-blue-500 font-medium' : ''}`}>
                    <FileText className="h-5 w-5" />
                    <span>Отчеты</span>
                  </button>
                </>
              )}
              
              {user?.user_type === 'deputy' && (
                <button onClick={() => setCurrentView('deputy')} className={`flex items-center space-x-2 hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } ${currentView === 'deputy' ? 'text-blue-500 font-medium' : ''}`}>
                  <BarChart3 className="h-5 w-5" />
                  <span>Кабинет</span>
                </button>
              )}

              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}>
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    {user.user_type === 'admin' ? (
                      <Shield className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-blue-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {user.name || user.username}
                    </span>
                  </div>
                  <button onClick={logout} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition">
                    <LogOut className="h-4 w-4" />
                    <span>Выход</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition">
                  <LogIn className="h-4 w-4" />
                  <span>Вход</span>
                </button>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? (
                <X className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {showAuthModal && <LoginModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

// Модальное окно для отметки посещаемости
const AttendanceModal = ({ session, deputies, onClose, onSave }) => {
  const { theme } = useTheme();
  const [selectedDeputies, setSelectedDeputies] = useState(session.attendees || []);

  const toggleDeputy = (deputyId) => {
    setSelectedDeputies(prev => 
      prev.includes(deputyId) 
        ? prev.filter(id => id !== deputyId)
        : [...prev, deputyId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const attendancePercent = Math.round((selectedDeputies.length / deputies.length) * 100);
    onSave({
      ...session,
      attendees: selectedDeputies,
      attendance: attendancePercent
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
      } rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Отметить посещаемость</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {session.title}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(session.date).toLocaleDateString('ru-RU')} • {session.time}
          </p>
          <div className="mt-4">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Присутствовало: {selectedDeputies.length} из {deputies.length} 
              ({Math.round((selectedDeputies.length / deputies.length) * 100)}%)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {deputies.map(deputy => (
              <label
                key={deputy.id}
                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition ${
                  selectedDeputies.includes(deputy.id)
                    ? theme === 'dark'
                      ? 'bg-green-900/30 border-2 border-green-500'
                      : 'bg-green-100 border-2 border-green-500'
                    : theme === 'dark'
                      ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDeputies.includes(deputy.id)}
                  onChange={() => toggleDeputy(deputy.id)}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {deputy.name}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {deputy.party}
                  </div>
                </div>
                {selectedDeputies.includes(deputy.id) && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </label>
            ))}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition"
            >
              <Save className="inline h-4 w-4 mr-2" />
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } font-medium transition`}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Модальное окно входа
const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      setError(result.error || 'Неверный логин или пароль');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
      } rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Вход в систему</h2>
          <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Тестовые аккаунты:
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <p><strong>Админ:</strong> admin / Admin123!</p>
              <p><strong>Депутат 1:</strong> deputy1 / Deputy123!</p>
              <p><strong>Депутат 2:</strong> deputy2 / Deputy123!</p>
            </div>
          </div>
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
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50"
          >
{loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <button onClick={onClose} className={`mt-4 w-full ${
          theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

// Главная страница
const MainPage = () => {
  const { theme } = useTheme();
  const { deputies, parties, sessions } = useData();

  const statistics = {
    totalDeputies: deputies.length,
    activeDeputies: deputies.filter(d => d.attendance > 80).length,
    totalParties: parties.length,
    totalSessions: sessions.length,
    averageAttendance: Math.round(deputies.reduce((acc, d) => acc + d.attendance, 0) / deputies.length * 10) / 10
  };

  const StatsCard = ({ icon: Icon, title, value, gradient }) => (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
        : 'bg-white shadow-lg'
    } rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
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
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Парламент
              <span className="block text-3xl md:text-5xl mt-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Российской Федерации
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Информационная система управления деятельностью парламента
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={Users} 
              title="Всего депутатов" 
              value={statistics.totalDeputies}
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
              title="Заседаний" 
              value={statistics.totalSessions}
              gradient="from-purple-500 to-purple-600"
            />
            <StatsCard 
              icon={TrendingUp} 
              title="Средняя явка" 
              value={`${statistics.averageAttendance}%`}
              gradient="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      </section>

      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Последние заседания
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.slice(0, 3).map(session => (
              <div key={session.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6`}>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                  {session.title}
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{new Date(session.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{session.time}</span>
                  </div>
                  {session.status === 'completed' && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Явка:
                      </span>
                      <span className="font-bold text-green-500">{session.attendance}%</span>
                    </div>
                  )}
                </div>
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
  const { deputies, parties } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParty, setFilterParty] = useState('');

  const filteredDeputies = deputies.filter(deputy => 
    deputy.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterParty === '' || deputy.party === filterParty)
  );

  const getPartyColor = (partyName) => {
    const party = parties.find(p => p.name === partyName);
    return party?.color || '#gray';
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Депутаты
          </h1>
          
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className={`flex items-center px-4 py-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              } border`}>
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Поиск депутата..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 bg-transparent outline-none ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className={`px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Все партии</option>
              {parties.map(party => (
                <option key={party.id} value={party.name}>{party.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeputies.map(deputy => (
            <div key={deputy.id} className={`${
              theme === 'dark' 
                ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                : 'bg-white shadow-lg'
            } rounded-xl p-6 hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-start space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getPartyColor(deputy.party) }}
                >
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {deputy.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {deputy.party}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    {deputy.district}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Посещаемость:
                      </span>
                      <span className={deputy.attendance >= 85 ? 'text-green-500' : 'text-orange-500'}>
                        {deputy.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Голосований:
                      </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {deputy.votes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Страница заседаний
const SessionsPage = () => {
  const { theme } = useTheme();
  const { sessions } = useData();
  const [filterType, setFilterType] = useState('all');

  const filteredSessions = sessions.filter(session => 
    filterType === 'all' || session.type === filterType
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-500';
      case 'scheduled': return 'text-blue-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Завершено';
      case 'scheduled': return 'Запланировано';
      case 'cancelled': return 'Отменено';
      default: return 'Неизвестно';
    }
  };

  const getTypeText = (type) => {
    switch(type) {
      case 'plenary': return 'Пленарное';
      case 'committee': return 'Комитет';
      case 'working_group': return 'Рабочая группа';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Заседания
          </h1>
          
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterType('plenary')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'plenary'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Пленарные
            </button>
            <button
              onClick={() => setFilterType('committee')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'committee'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Комитеты
            </button>
            <button
              onClick={() => setFilterType('working_group')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'working_group'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Рабочие группы
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.map(session => (
            <div key={session.id} className={`${
              theme === 'dark' 
                ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                : 'bg-white shadow-lg'
            } rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {session.title}
                </h3>
                <span className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{new Date(session.date).toLocaleDateString('ru-RU')}</span>
                </div>
                
                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock className="h-4 w-4 mr-2 text-green-500" />
                  <span>{session.time}</span>
                </div>
                
                <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Building2 className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{getTypeText(session.type)}</span>
                </div>
                
                {session.status === 'completed' && (
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Явка:
                    </span>
                    <span className={`font-bold ${session.attendance >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                      {session.attendance}%
                    </span>
                  </div>
                )}
                
                {session.agenda && session.agenda.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Повестка:
                    </p>
                    <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.agenda.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Страница партий
const PartiesPage = () => {
  const { theme } = useTheme();
  const { parties, deputies } = useData();

  const getPartyStats = (partyName) => {
    const partyDeputies = deputies.filter(d => d.party === partyName);
    return {
      count: partyDeputies.length,
      avgAttendance: partyDeputies.length > 0 
        ? Math.round(partyDeputies.reduce((acc, d) => acc + d.attendance, 0) / partyDeputies.length)
        : 0
    };
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Политические партии
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Партии представленные в парламенте
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map(party => {
            const stats = getPartyStats(party.name);
            return (
              <div key={party.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6 hover:shadow-xl transition-all duration-300`}>
                <div className="text-center mb-4">
                  <div 
                    className="w-20 h-20 mx-auto rounded-full mb-4"
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <h3 className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {party.name}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Лидер:
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {party.leader}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Основана:
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {party.founded}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Депутатов:
                    </span>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.count} / {party.members}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Средняя явка:
                    </span>
                    <span className={`text-sm font-bold ${stats.avgAttendance >= 85 ? 'text-green-500' : 'text-orange-500'}`}>
                      {stats.avgAttendance}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Страница статистики
const StatsPage = () => {
  const { theme } = useTheme();
  const { deputies, parties, sessions } = useData();

  const votingStats = {
    totalVotes: sessions.filter(s => s.status === 'completed').length,
    scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
    avgAttendance: Math.round(
      sessions.filter(s => s.status === 'completed' && s.attendance)
        .reduce((acc, s) => acc + s.attendance, 0) / 
      sessions.filter(s => s.status === 'completed' && s.attendance).length || 0
    )
  };

  const partyAttendance = parties.map(party => {
    const partyDeputies = deputies.filter(d => d.party === party.name);
    const avgAttendance = partyDeputies.length > 0
      ? Math.round(partyDeputies.reduce((acc, d) => acc + d.attendance, 0) / partyDeputies.length)
      : 0;
    return {
      name: party.name,
      attendance: avgAttendance,
      color: party.color
    };
  });

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Статистика работы парламента
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{votingStats.totalVotes}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Проведено заседаний
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-blue-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{votingStats.scheduledSessions}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Запланировано
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{votingStats.avgAttendance}%</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Средняя явка
            </h3>
          </div>
        </div>

        <div className={`${
          theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
        } rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Посещаемость по партиям
          </h2>
          <div className="space-y-4">
            {partyAttendance.map((party, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: party.color }}></div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {party.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`flex-1 h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
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
      </div>
    </div>
  );
};

// Админ панель
const AdminPanel = () => {
  const { theme } = useTheme();
  const { user, accounts } = useAuth();
  const { 
    deputies, parties, sessions,
    addDeputy, updateDeputy, deleteDeputy,
    addParty, updateParty, deleteParty,
    addSession, updateSession, deleteSession
  } = useData();
  
  const [activeTab, setActiveTab] = useState('deputies');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAccountsList, setShowAccountsList] = useState(false);

  if (user?.user_type !== 'admin') {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold">Доступ запрещен</h2>
          <p className="mt-2">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  const handleSaveDeputy = (data) => {
    if (editingItem) {
      updateDeputy(editingItem.id, data);
    } else {
      addDeputy(data);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSaveParty = (data) => {
    if (editingItem) {
      updateParty(editingItem.id, data);
    } else {
      addParty(data);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSaveSession = (data) => {
    if (editingItem) {
      updateSession(editingItem.id, data);
    } else {
      addSession(data);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Панель администратора
          </h1>
          <button
            onClick={() => setShowAccountsList(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition"
          >
            <Shield className="h-5 w-5" />
            <span>Все аккаунты ({Object.keys(accounts).length})</span>
          </button>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('deputies')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'deputies'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Депутаты
          </button>
          <button
            onClick={() => setActiveTab('parties')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'parties'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Партии
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Заседания
          </button>
        </div>

        {activeTab === 'deputies' && (
          <DeputiesAdmin 
            deputies={deputies}
            parties={parties}
            onAdd={() => { setEditingItem(null); setShowForm(true); }}
            onEdit={(deputy) => { setEditingItem(deputy); setShowForm(true); }}
            onDelete={deleteDeputy}
            showForm={showForm}
            setShowForm={setShowForm}
            editingItem={editingItem}
            onSave={handleSaveDeputy}
          />
        )}

        {activeTab === 'parties' && (
          <PartiesAdmin 
            parties={parties}
            onAdd={() => { setEditingItem(null); setShowForm(true); }}
            onEdit={(party) => { setEditingItem(party); setShowForm(true); }}
            onDelete={deleteParty}
            showForm={showForm}
            setShowForm={setShowForm}
            editingItem={editingItem}
            onSave={handleSaveParty}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsAdmin 
            sessions={sessions}
            onAdd={() => { setEditingItem(null); setShowForm(true); }}
            onEdit={(session) => { setEditingItem(session); setShowForm(true); }}
            onDelete={deleteSession}
            showForm={showForm}
            setShowForm={setShowForm}
            editingItem={editingItem}
            onSave={handleSaveSession}
          />
        )}
      </div>

      {showAccountsList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          } rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Все аккаунты системы</h2>
              <button
                onClick={() => setShowAccountsList(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(accounts).map(([username, account]) => {
                const deputy = deputies.find(d => d.id === account.deputyId);
                return (
                  <div
                    key={username}
                    className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {account.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            account.user_type === 'admin'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {account.user_type === 'admin' ? 'Администратор' : 'Депутат'}
                          </span>
                        </div>
                        <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>Логин: <span className="font-mono">{username}</span></p>
                          {deputy && (
                            <>
                              <p>Партия: {deputy.party}</p>
                              <p>Округ: {deputy.district}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        ID: {account.id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Примечание:</strong> Пароли хранятся в зашифрованном виде и не отображаются из соображений безопасности.
                Для изменения пароля используйте функцию управления аккаунтами в разделе "Депутаты".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// DeputiesAdmin компонент
const DeputiesAdmin = ({ deputies, parties, onAdd, onEdit, onDelete, showForm, setShowForm, editingItem, onSave }) => {
  const { theme } = useTheme();
  const { createAccount, updateAccount, deleteAccount, getAccountByDeputyId } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    district: '',
    attendance: 0,
    votes: 0,
    speeches: 0,
    email: '',
    phone: ''
  });
  const [accountData, setAccountData] = useState({
    username: '',
    password: ''
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedDeputy, setSelectedDeputy] = useState(null);

  React.useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        name: '',
        party: '',
        district: '',
        attendance: 0,
        votes: 0,
        speeches: 0,
        email: '',
        phone: ''
      });
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCreateAccount = (deputy) => {
    setSelectedDeputy(deputy);
    const existingAccount = getAccountByDeputyId(deputy.id);
    if (existingAccount) {
      setAccountData({
        username: existingAccount.username,
        password: ''
      });
    } else {
      const lastName = deputy.name.split(' ')[0].toLowerCase();
      setAccountData({
        username: `deputy_${lastName}`,
        password: `Deputy123!`
      });
    }
    setShowAccountModal(true);
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (!passwordRegex.test(accountData.password)) {
      alert('Пароль должен содержать минимум 8 символов, включая:\n' +
            '- Заглавные буквы (A-Z)\n' +
            '- Строчные буквы (a-z)\n' +
            '- Цифры (0-9)\n' +
            '- Специальные символы (@$!%*?&#)');
      return;
    }
    
    if (selectedDeputy) {
      const existingAccount = getAccountByDeputyId(selectedDeputy.id);
      if (existingAccount) {
        updateAccount(existingAccount.username, accountData.password);
      } else {
        createAccount(selectedDeputy.id, accountData.username, accountData.password, selectedDeputy.name);
      }
      setShowAccountModal(false);
      alert(`Аккаунт успешно ${existingAccount ? 'обновлен' : 'создан'}!\nЛогин: ${accountData.username}\nПароль: ${accountData.password}`);
    }
  };

  const handleDeleteAccount = (deputy) => {
    const account = getAccountByDeputyId(deputy.id);
    if (account && window.confirm('Удалить аккаунт депутата?')) {
      deleteAccount(account.username);
      alert('Аккаунт удален');
    }
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить депутата</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {deputies.map(deputy => {
          const hasAccount = !!getAccountByDeputyId(deputy.id);
          return (
            <div key={deputy.id} className={`${
              theme === 'dark' 
                ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                : 'bg-white shadow-lg'
            } rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {deputy.name}
                    {hasAccount && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        Есть аккаунт
                      </span>
                    )}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {deputy.party} • {deputy.district}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCreateAccount(deputy)}
                    className={`p-2 rounded-lg ${
                      hasAccount 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white transition`}
                    title={hasAccount ? 'Изменить пароль' : 'Создать аккаунт'}
                  >
                    {hasAccount ? <Shield className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                  {hasAccount && (
                    <button
                      onClick={() => handleDeleteAccount(deputy)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      title="Удалить аккаунт"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(deputy)}
                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          } rounded-2xl p-8 max-w-md w-full`}>
            <h2 className="text-2xl font-bold mb-6">
              {getAccountByDeputyId(selectedDeputy?.id) ? 'Изменить пароль' : 'Создать аккаунт'} для депутата
            </h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedDeputy?.name}
            </p>
            
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Логин
                </label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => setAccountData({...accountData, username: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                  required
                  disabled={getAccountByDeputyId(selectedDeputy?.id)}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Пароль
                </label>
                <input
                  type="text"
                  value={accountData.password}
                  onChange={(e) => setAccountData({...accountData, password: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Введите пароль"
                  required
                />
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Минимум 8 символов: заглавные, строчные буквы, цифры и спецсимволы
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  {getAccountByDeputyId(selectedDeputy?.id) ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className={`flex-1 py-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } font-medium transition`}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          } rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Редактировать депутата' : 'Добавить депутата'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="ФИО"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <select
                value={formData.party}
                onChange={(e) => setFormData({...formData, party: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              >
                <option value="">Выберите партию</option>
                {parties.map(party => (
                  <option key={party.id} value={party.name}>{party.name}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Избирательный округ"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Посещаемость %"
                  value={formData.attendance}
                  onChange={(e) => setFormData({...formData, attendance: parseInt(e.target.value)})}
                  className={`px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                  min="0"
                  max="100"
                />
                
                <input
                  type="number"
                  placeholder="Голосований"
                  value={formData.votes}
                  onChange={(e) => setFormData({...formData, votes: parseInt(e.target.value)})}
                  className={`px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                  min="0"
                />
                
                <input
                  type="number"
                  placeholder="Выступлений"
                  value={formData.speeches}
                  onChange={(e) => setFormData({...formData, speeches: parseInt(e.target.value)})}
                  className={`px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                  min="0"
                />
              </div>
              
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
              />
              
              <input
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
              />
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } font-medium transition`}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// PartiesAdmin компонент
const PartiesAdmin = ({ parties, onAdd, onEdit, onDelete, showForm, setShowForm, editingItem, onSave }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    members: 0,
    leader: '',
    founded: 2000
  });

  React.useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        name: '',
        color: '#000000',
        members: 0,
        leader: '',
        founded: 2000
      });
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить партию</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parties.map(party => (
          <div key={party.id} className={`${
            theme === 'dark' 
              ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
              : 'bg-white shadow-lg'
          } rounded-xl p-4`}>
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: party.color }}
              ></div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(party)}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(party.id)}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {party.name}
            </h3>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Лидер: {party.leader}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Членов: {party.members}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          } rounded-2xl p-8 max-w-md w-full`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Редактировать партию' : 'Добавить партию'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Название партии"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <div className="flex space-x-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="h-12 w-20"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className={`flex-1 px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              
              <input
                type="text"
                placeholder="Лидер партии"
                value={formData.leader}
                onChange={(e) => setFormData({...formData, leader: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <input
                type="number"
                placeholder="Количество членов"
                value={formData.members}
                onChange={(e) => setFormData({...formData, members: parseInt(e.target.value)})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                min="1"
                required
              />
              
              <input
                type="number"
                placeholder="Год основания"
                value={formData.founded}
                onChange={(e) => setFormData({...formData, founded: parseInt(e.target.value)})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                min="1900"
                max="2025"
                required
              />
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } font-medium transition`}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// SessionsAdmin компонент
const SessionsAdmin = ({ sessions, onAdd, onEdit, onDelete, showForm, setShowForm, editingItem, onSave }) => {
  const { theme } = useTheme();
  const { deputies } = useData();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({	
    title: '',
    date: '',
    time: '',
    type: 'plenary',
    agenda: []
  });

  React.useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        type: 'plenary',
        agenda: []
      });
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAttendance = (session) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить заседание</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sessions.map(session => (
          <div key={session.id} className={`${
            theme === 'dark' 
              ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
              : 'bg-white shadow-lg'
          } rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {session.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(session.date).toLocaleDateString('ru-RU')} • {session.time}
                </p>
                {session.attendees && (
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Присутствовало: {session.attendees.length} из {deputies.length}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAttendance(session)}
                  className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                  title="Отметить посещаемость"
                >
                  <UserCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(session)}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(session.id)}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAttendanceModal && selectedSession && (
        <AttendanceModal
          session={selectedSession}
          deputies={deputies}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
          }}
          onSave={onSave}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          } rounded-2xl p-8 max-w-md w-full`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Редактировать заседание' : 'Добавить заседание'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Название заседания"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                required
              />
              
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white'
                }`}
              >
                <option value="plenary">Пленарное</option>
                <option value="committee">Комитет</option>
                <option value="working_group">Рабочая группа</option>
              </select>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } font-medium transition`}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// AttendanceReport компонент
const AttendanceReport = () => {
  const { theme } = useTheme();
  const { deputies, sessions } = useData();

  const getDeputyStats = (deputyId) => {
    const completedSessions = sessions.filter(s => s.status === 'completed' && s.attendees);
    const attended = completedSessions.filter(s => s.attendees.includes(deputyId)).length;
    const total = completedSessions.length;
    return {
      attended,
      total,
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0
    };
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Отчет по посещаемости
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {deputies.map(deputy => {
            const stats = getDeputyStats(deputy.id);
            return (
              <div key={deputy.id} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 backdrop-blur border border-gray-700' 
                  : 'bg-white shadow-lg'
              } rounded-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {deputy.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {deputy.party}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      stats.percentage >= 85 ? 'text-green-500' : 
                      stats.percentage >= 70 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {stats.percentage}%
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stats.attended} из {stats.total}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// DeputyCabinet компонент
const DeputyCabinet = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { deputies, sessions } = useData();
  
  if (user?.user_type !== 'deputy') {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold">Доступ запрещен</h2>
          <p className="mt-2">Эта страница доступна только для депутатов</p>
        </div>
      </div>
    );
  }

  const deputyData = deputies.find(d => d.id === user.deputyId) || deputies[0];
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Личный кабинет депутата
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Добро пожаловать, {deputyData.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{deputyData.attendance}%</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Посещаемость
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{deputyData.votes}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Голосований
            </h3>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-purple-500" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{deputyData.speeches}</span>
            </div>
            <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Выступлений
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Предстоящие заседания
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div key={session.id} className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {session.title}
                  </h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {new Date(session.date).toLocaleDateString('ru-RU')}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      <Clock className="inline h-4 w-4 mr-1" />
                      {session.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-gray-800/50 backdrop-blur border border-gray-700' : 'bg-white shadow-lg'
          } rounded-xl p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Личная информация
            </h2>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Партия
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {deputyData.party}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Избирательный округ
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {deputyData.district}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {deputyData.email}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Телефон
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {deputyData.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Основное приложение
const App = () => {
  const [currentView, setCurrentView] = useState('main');

  const renderView = () => {
    switch (currentView) {
      case 'main':
        return <MainPage />;
      case 'deputies':
        return <DeputiesPage />;
      case 'sessions':
        return <SessionsPage />;
      case 'parties':
        return <PartiesPage />;
      case 'stats':
        return <StatsPage />;
      case 'admin':
        return <AdminPanel />;
      case 'deputy':
        return <DeputyCabinet />;
      case 'attendance':
        return <AttendanceReport />;
      default:
        return <MainPage />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen">
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            {renderView()}
          </div>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;