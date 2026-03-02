import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useEvent } from './EventContext';

export interface Notification {
  id: string;
  type: 'risk' | 'document' | 'plan' | 'decision' | 'system' | 'success' | 'warning';
  title: string;
  description?: string;
  icon?: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useEvent();

  // Map event types to notification objects
  const handleSocketEvent = useCallback((eventName: string, data: any) => {
    let notification: Omit<Notification, 'id' | 'read' | 'timestamp'> | null = null;

    switch (eventName) {
      case 'risk.detected':
        notification = {
          type: 'risk',
          title: '⚠️ Risco Detectado',
          description: `Risco de alta severidade identificado em: ${data.title}`,
          actionUrl: '/app/risks'
        };
        break;

      case 'document:uploaded':
        notification = {
          type: 'document',
          title: '📄 Documento Enviado',
          description: `${data.title} foi enviado com sucesso`,
          actionUrl: `/app/documents/${data.id}`
        };
        break;

      case 'document:processed':
        notification = {
          type: 'document',
          title: '✅ Análise Concluída',
          description: `Análise do documento "${data.title}" foi finalizada`,
          actionUrl: `/app/documents/${data.id}`
        };
        break;

      case 'document:insights_extracted':
        notification = {
          type: 'document',
          title: '💡 Insights Extraídos',
          description: `Novas sugestões disponíveis para: ${data.title}`,
          actionUrl: `/app/documents/${data.id}`
        };
        break;

      case 'plan:created':
        notification = {
          type: 'plan',
          title: '📋 Plano Criado',
          description: `Novo plano de execução: ${data.title}`,
          actionUrl: `/app/plans/${data.id}`
        };
        break;

      case 'decision:created':
        notification = {
          type: 'decision',
          title: '🎯 Decisão Registrada',
          description: `Nova decisão: ${data.title}`,
          actionUrl: `/app/decisions/${data.id}`
        };
        break;

      case 'metrics:health:update':
        const healthScore = data.overallScore;
        const healthStatus = healthScore >= 75 ? 'good' : healthScore >= 55 ? 'warning' : 'critical';
        
        if (healthStatus === 'critical' || healthStatus === 'warning') {
          notification = {
            type: 'system',
            title: healthStatus === 'critical' ? '🔴 Saúde Crítica' : '🟡 Saúde Reduzida',
            description: `Saúde do sistema: ${healthScore}%`,
            actionUrl: '/app/status'
          };
        }
        break;

      case 'metrics:dna:update':
        notification = {
          type: 'system',
          title: '🧬 DNA Estratégico Atualizado',
          description: `Sua análise estratégica foi recalculada. Score geral: ${data.overallScore}`,
          actionUrl: '/app/dna'
        };
        break;

      case 'task.overdue':
        notification = {
          type: 'warning',
          title: '⏰ Tarefa Atrasada',
          description: `Tarefa "${data.title}" passou da data. Ação necessária!`,
          actionUrl: `/app/plans/${data.planId}`
        };
        break;

      case 'event:new':
        // Generic event notification
        if (data.eventType === 'suggestion.created') {
          notification = {
            type: 'success',
            title: '💭 Nova Sugestão',
            description: 'Sugestão de decisão ou plano está disponível',
            actionUrl: '/app/dashboard'
          };
        }
        break;
    }

    if (notification) {
      addNotification(notification);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Register all event listeners
    const events = [
      'risk.detected',
      'document:uploaded',
      'document:processed',
      'document:insights_extracted',
      'plan:created',
      'decision:created',
      'metrics:health:update',
      'metrics:dna:update',
      'task.overdue',
      'event:new'
    ];

    events.forEach(eventName => {
      socket.on(eventName, (data) => handleSocketEvent(eventName, data));
    });

    return () => {
      events.forEach(eventName => {
        socket.off(eventName);
      });
    };
  }, [socket, handleSocketEvent]);

  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notif,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
