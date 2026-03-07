import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme, savePreferences } = usePreferences();
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

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await savePreferences({ theme: newTheme });
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
        className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(to top right, var(--bg-tertiary), var(--text-secondary))',
          borderColor: 'var(--border-color)'
        }}

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
              className="absolute right-0 mt-3 w-64 border rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor()} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                    {getInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {user?.displayName && (
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.displayName}
                      </p>
                    )}
                    <p className="text-xs truncate opacity-60" style={{ color: 'var(--text-secondary)' }}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="p-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-secondary)' }}>
                  Tema
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${theme === 'light' ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <Icons.Sun className="w-4 h-4" />
                    <span className="text-[10px] font-medium">Claro</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${theme === 'dark' ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <Icons.Moon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">Escuro</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${theme === 'system' ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <Icons.Monitor className="w-4 h-4" />
                    <span className="text-[10px] font-medium">Sistema</span>
                  </button>
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--nav-hover)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Icons.User className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Perfil</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    navigate('/app/settings');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--nav-hover)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Icons.Settings className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Configurações</span>
                </button>

                {/* Billing */}
                <button
                  onClick={() => {
                    navigate('/app/billing');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--nav-hover)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Icons.CreditCard className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Plano & Faturamento</span>
                </button>

                {/* Divider */}
                <div className="my-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-lg transition-colors"
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
