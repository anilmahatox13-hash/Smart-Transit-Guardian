import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bus, Navigation, Radio, LayoutGrid, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-base text-slate-900 dark:text-white tracking-tight">
                SmartTransit
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal -mt-1">
                Fleet Management
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && (
              <nav className="flex items-center space-x-1 mr-2">
                <Link
                  to="/"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/')
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Map</span>
                </Link>

                {user.role === 'driver' && (
                  <Link
                    to="/driver"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/driver')
                        ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Driver Console</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin')
                        ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{user.name}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Sign up
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