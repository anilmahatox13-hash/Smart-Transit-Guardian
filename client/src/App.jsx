import React from 'react';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🚍
        </div>
        <h1 className="text-2xl font-bold text-emerald-400 mb-2">Smart Transit Guardian</h1>
        <p className="text-slate-400 text-sm mb-6">Frontend Client Initialized & Connected.</p>
        <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300">
          Status: {user ? `Logged in as ${user.name}` : 'Ready for Auth & Live Maps'}
        </div>
      </div>
    </div>
  );
}

export default App;
