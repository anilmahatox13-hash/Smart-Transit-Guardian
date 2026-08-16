import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Navigation, Shield, LogOut, Radio, LayoutGrid } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/10';
      case 'driver':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo with Glow */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-200">
                <Bus className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  SmartTransit
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase -mt-0.5">
                Guardian Fleet AI
              </span>
            </div>
          </Link>

          {/* Navigation Links & Action Hub */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Live Map Link */}
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/')
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Live Fleet Map</span>
                </Link>

                {/* Driver Link */}
                {user.role === 'driver' && (
                  <Link
                    to="/driver"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive('/driver')
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Driver Console</span>
                  </Link>
                )}

                {/* Admin Link */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive('/admin')
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Admin Hub</span>
                  </Link>
                )}

                {/* User Profile Info Pill */}
                <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                    <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md border inline-block mt-0.5 shadow-sm ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;