import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useEvent } from './EventContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type StrategicMode = 'conservador' | 'equilibrado' | 'expansao';

interface StrategicContextType {
  mode: StrategicMode;
  setMode: (mode: StrategicMode) => void;
  getModeLabel: () => string;
  getModeColor: () => string;
}

const StrategicContext = createContext<StrategicContextType | undefined>(undefined);

export function StrategicProvider({ children }: { children: ReactNode }) {
  const { emitEvent } = useEvent();
  const { user, getIdToken } = useAuth();

  const [mode, setModeState] = useState<StrategicMode>('equilibrado');

  // Fetch initial mode from backend
  useEffect(() => {
    const fetchMode = async () => {
      if (!user) {
        setModeState('equilibrado');
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          return;
        }

        const res = await fetch('/api/user/mode', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.mode) {
            console.log('[StrategicContext] Mode loaded from backend:', data.mode);
            setModeState(data.mode as StrategicMode);
          }
        } else if (res.status !== 401) {
          console.error('Failed to fetch strategic mode:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch strategic mode:', error);
      }
    };
    fetchMode();
  }, [user, getIdToken]);

  const setMode = (newMode: StrategicMode) => {
    if (newMode !== mode) {
      const oldMode = mode;
      console.log('[StrategicContext] Mode changed:', oldMode, '->', newMode);
      setModeState(newMode);

      // Emit event for audit log and backend persistence
      emitEvent('mode.changed', 'system', 'global-mode', {
        oldMode,
        newMode,
        timestamp: new Date().toISOString()
      });

      // Show toast notification (skip if it's the initial load)
      if (oldMode !== 'equilibrado' || newMode !== 'equilibrado') {
        const modeLabel = newMode === 'conservador' ? 'Conservador' : newMode === 'equilibrado' ? 'Equilibrado' : 'Expansão';
        toast.info(`🎯 Modo alterado: ${modeLabel}`);
      }
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'conservador': return 'Conservador';
      case 'equilibrado': return 'Equilibrado';
      case 'expansao': return 'Expansão';
      default: return 'Equilibrado';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'conservador': return 'text-[var(--status-info)] bg-[var(--status-info-bg)] border-[var(--status-info-bg)]';
      case 'equilibrado': return 'text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success-bg)]';
      case 'expansao': return 'text-[var(--status-warning)] bg-[var(--status-warning-bg)] border-[var(--status-warning-bg)]';
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-color)]';
    }
  };

  return (
    <StrategicContext.Provider value={{ mode, setMode, getModeLabel, getModeColor }}>
      {children}
    </StrategicContext.Provider>
  );
}

export function useStrategicMode() {
  const context = useContext(StrategicContext);
  if (context === undefined) {
    throw new Error('useStrategicMode must be used within a StrategicProvider');
  }
  return context;
}
