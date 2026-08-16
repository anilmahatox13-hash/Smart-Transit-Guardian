import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import BrandLogo from './BrandLogo';
import RegionModal from './RegionModal';
import { 
  Navigation, 
  Radio, 
  LayoutGrid, 
  LogOut, 
  Sun, 
  Moon, 
  Globe, 
  ChevronDown, 
  Building2, 
  Ticket,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { province, flag } = useRegion();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center">
              <BrandLogo size="md" />
            </Link>

            {/* Role-Specific Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1.5">
                
                {/* 1. All Users see Live Map */}
                <Link
                  to="/"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive('/') 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('liveMap')}</span>
                </Link>

                {/* 2. ONLY Passengers see My Tickets */}
                {user.role === 'passenger' && (
                  <Link
                    to="/my-tickets"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive('/my-tickets') 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>My Tickets</span>
                  </Link>
                )}

                {/* 3. ONLY Bus Owners / Operators see Owner Portal */}
                {(user.role === 'operator' || user.role === 'admin') && (
                  <Link
                    to="/operator"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive('/operator') 
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Owner Portal</span>
                  </Link>
                )}

                {/* 4. ONLY Drivers see Driver Console */}
                {(user.role === 'driver' || user.role === 'admin') && (
                  <Link
                    to="/driver"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive('/driver') 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{t('driverConsole')}</span>
                  </Link>
                )}

                {/* 5. ONLY Admins see Compliance */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive('/admin') 
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Compliance</span>
                  </Link>
                )}
              </nav>
            )}

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Region Pill */}
              <button
                onClick={() => setRegionModalOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition shadow-2xs"
              >
                <span>{flag}</span>
                <span className="hidden sm:inline truncate max-w-[110px]">{province.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Language Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
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
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* User Dropdown */}
              {user ? (
                <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold inline-block mt-0.5">
                          {user.role}
                        </span>
                      </div>

                      {/* Dropdown: ONLY Passengers see My Tickets */}
                      {user.role === 'passenger' && (
                        <Link
                          to="/my-tickets"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <Ticket className="w-4 h-4 text-emerald-500" />
                          <span>My Tickets</span>
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-800 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  {t('signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <RegionModal isOpen={regionModalOpen} onClose={() => setRegionModalOpen(false)} />
    </>
  );
};

export default Navbar;