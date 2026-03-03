import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getSocketBaseUrl } from '../lib/runtimeConfig';

// --- Types ---

export type EventType =
  // Decisions
  | 'decision.created'
  | 'decision.updated'
  | 'decision.linked_to_plan'
  | 'decision.outcome_marked'
  // Sessions
  | 'session.started'
  | 'session.completed'
  | 'session.resumed'
  // Plans/Tasks
  | 'plan.created'
  | 'plan.updated'
  | 'plan.status_changed'
  | 'plan.completed'
  | 'task.created'
  | 'task.completed'
  | 'task.overdue'
  | 'dependency.blocked'
  // Risks
  | 'risk.detected'
  | 'risk.escalated'
  | 'risk.deescalated'
  | 'risk.resolved'
  | 'risk.dismissed'
  // Documents
  | 'document.uploaded'
  | 'document.processed'
  | 'document.insights_extracted'
  | 'document.linked_to_decision'
  | 'document.linked_to_plan'
  // System
  | 'mode.changed'
  | 'system.health_changed'
  | 'system.metrics_updated'
  | 'dna.updated';

export type EntityType = 'decision' | 'plan' | 'task' | 'risk' | 'document' | 'system' | 'session';

export interface EventLog {
  id: string;
  userId: string;
  eventType: EventType;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ExplanationLog {
  id: string;
  userId: string;
  relatedEventId: string;
  title: string;
  whatChanged: string;
  whyChanged: string;
  impact: string;
  recommendation: string;
  deltas?: Record<string, any>;
  createdAt: string;
}

interface EventContextType {
  events: EventLog[];
  explanations: ExplanationLog[];
  socket: Socket | null;
  emitEvent: (eventType: EventType, entityType: EntityType, entityId?: string, metadata?: Record<string, any>) => void;
  getRecentExplanations: (limit?: number) => ExplanationLog[];
  getExplanationsByEntity: (entityType: EntityType, limit?: number) => ExplanationLog[];
}

// --- Context ---

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [explanations, setExplanations] = useState<ExplanationLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, getIdToken } = useAuth();

  // Initialize Socket.io
  useEffect(() => {
    let cancelled = false;
    let activeSocket: Socket | null = null;

    if (!user) {
      setSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const initializeSocket = async () => {
      try {
        // Get Firebase auth token
        const token = await getIdToken();
        if (!token || cancelled) {
          return;
        }

        const newSocket = io(getSocketBaseUrl(), {
          path: '/socket.io',
          auth: { token },
        });

        if (cancelled) {
          newSocket.disconnect();
          return;
        }

        activeSocket = newSocket;

        setSocket(prev => {
          if (prev) prev.disconnect();
          return newSocket;
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
        });

        // Listen for new events from backend
        newSocket.on('event:new', (event: EventLog) => {
          setEvents(prev => [event, ...prev]);
        });

        // Listen for new explanations from backend
        newSocket.on('explanation:new', (explanation: ExplanationLog) => {
          setExplanations(prev => [explanation, ...prev]);
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocket();

    return () => {
      cancelled = true;
      if (activeSocket) activeSocket.disconnect();
    };
  }, [user?.uid, getIdToken]);

  // Fetch initial explanations
  useEffect(() => {
    const fetchExplanations = async () => {
      if (!user) return;
      
      try {
        const token = await getIdToken();
        const res = await fetch('/api/explanations?limit=20', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setExplanations(data);
        }
      } catch (error) {
        console.error('Failed to fetch explanations:', error);
      }
    };
    fetchExplanations();
  }, [user, getIdToken]);

  const emitEvent = async (eventType: EventType, entityType: EntityType, entityId?: string, metadata?: Record<string, any>) => {
    if (!user) {
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        return;
      }

      // Send event to backend API
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType,
          entityType,
          entityId,
          metadata,
          userId: user.uid
        })
      });
    } catch (error) {
      console.error('Failed to emit event:', error);
    }
  };

  const getRecentExplanations = (limit: number = 20) => {
    return explanations.slice(0, limit);
  };

  const getExplanationsByEntity = (entityType: EntityType, limit: number = 5) => {
    // Basic filtering based on content keywords as a fallback if entity relation is complex
    // Ideally backend should support filtering by entity type
    return explanations.filter(exp => {
      const content = (exp.title + exp.whatChanged + exp.whyChanged).toLowerCase();
      if (entityType === 'system') return content.includes('sistema') || content.includes('modo') || content.includes('dna');
      if (entityType === 'risk') return content.includes('risco') || content.includes('alerta');
      if (entityType === 'plan') return content.includes('plano') || content.includes('tarefa') || content.includes('execução');
      if (entityType === 'decision') return content.includes('decisão');
      return true;
    }).slice(0, limit);
  };

  return (
    <EventContext.Provider value={{ events, explanations, socket, emitEvent, getRecentExplanations, getExplanationsByEntity }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
