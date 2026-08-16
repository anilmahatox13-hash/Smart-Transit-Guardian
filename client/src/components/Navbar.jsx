import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Bus, Navigation, Radio, LayoutGrid, LogOut, Sun, Moon, Globe, ChevronDown, UserPlus, Settings as SettingsIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">SmartTransit</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-1 font-mono">Guardian Fleet</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && (
              <nav className="flex items-center space-x-1 mr-1">
                <Link
                  to="/"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/') ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('liveMap')}</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin') ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{t('adminHub')}</span>
                  </Link>
                )}
              </nav>
            )}

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="ne">नेपाली</option>
                <option value="es">ES</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {user ? (
              <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold">{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('signUp')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;