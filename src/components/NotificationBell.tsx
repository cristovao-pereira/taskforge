import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Icons } from './Icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, dismissNotification, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'risk': return '⚠️';
      case 'document': return '📄';
      case 'plan': return '📋';
      case 'decision': return '🎯';
      case 'system': return '⚙️';
      case 'warning': return '⏰';
      case 'success': return '✅';
      default: return '🔔';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)] rounded-lg transition-colors relative group"
      >
        <Icons.Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--status-error)] rounded-full border-2 border-[var(--bg-primary)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--status-error)] rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></span>
          </>
        )}
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

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-96 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border-color)] opacity-90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.Bell className="w-4 h-4 text-[var(--accent-color)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-[var(--status-error-bg)] text-[var(--status-error)] px-2 py-1 rounded-full font-medium">
                      {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 hover:bg-zinc-700/50 rounded transition-colors"
                      title="Marcar todas como lidas"
                    >
                      ✓
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 hover:bg-zinc-700/50 rounded transition-colors"
                      title="Limpar tudo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Icons.Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-zinc-500">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`p-3 hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer group ${!notification.read ? 'bg-[var(--accent-color)]/5' : ''
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className="text-xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full flex-shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            {notification.description && (
                              <p className="text-xs text-zinc-400 leading-snug mt-1">
                                {notification.description}
                              </p>
                            )}
                            <p className="text-xs text-zinc-500 mt-1.5">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                            className="flex-shrink-0 text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Descartar"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="bg-[var(--bg-secondary)] px-4 py-2 border-t border-[var(--border-color)] text-center">
                  <button
                    onClick={() => {
                      navigate('/app/dashboard');
                      setIsOpen(false);
                    }}
                    className="text-xs text-[var(--accent-color)] hover:opacity-80 font-medium transition-colors"
                  >
                    Ver todas
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
