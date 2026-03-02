import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getAvatarColor = () => {
    const colors = [
      'from-blue-600 to-blue-500',
      'from-purple-600 to-purple-500',
      'from-pink-600 to-pink-500',
      'from-green-600 to-green-500',
      'from-orange-600 to-orange-500',
      'from-red-600 to-red-500',
    ];
    
    const index = (user?.uid?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 flex items-center justify-center text-xs font-bold text-white hover:border-zinc-400 transition-colors hover:shadow-lg hover:shadow-zinc-500/20"
        title={user?.displayName || user?.email || 'User'}
      >
        {getInitials()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor()} flex items-center justify-center text-sm font-bold text-white`}>
                    {getInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {user?.displayName && (
                      <p className="text-sm font-semibold text-white truncate">
                        {user.displayName}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1">
                {/* Profile */}
                <button
                  onClick={() => {
                    navigate('/app/settings');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <Icons.User className="w-4 h-4 text-zinc-400" />
                  <span>Perfil</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    navigate('/app/settings');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <Icons.Settings className="w-4 h-4 text-zinc-400" />
                  <span>Configurações</span>
                </button>

                {/* Billing */}
                <button
                  onClick={() => {
                    navigate('/app/billing');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <Icons.CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>Plano & Faturamento</span>
                </button>

                {/* Divider */}
                <div className="my-1 h-px bg-zinc-800"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Icons.LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
