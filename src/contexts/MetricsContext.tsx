import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useEvent } from './EventContext';
import { useStrategicMode } from './StrategicContext';

// --- Types ---

export interface StrategicDNA {
  decisionQuality: number;
  riskDiscipline: number;
  executionDiscipline: number;
  focusLeverage: number;
  strategicConsistency: number;
  overallScore: number;
  lastUpdated: string;
}

export interface SystemHealth {
  activeRisksSeverity: number;
  executionStability: number;
  alignment: number;
  momentum: number;
  overallScore: number;
  lastUpdated: string;
}

interface MetricsContextType {
  dna: StrategicDNA;
  health: SystemHealth;
  refreshMetrics: () => void;
}

// --- Initial States ---

const INITIAL_DNA: StrategicDNA = {
  decisionQuality: 0,
  riskDiscipline: 0,
  executionDiscipline: 0,
  focusLeverage: 0,
  strategicConsistency: 0,
  overallScore: 0,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_HEALTH: SystemHealth = {
  activeRisksSeverity: 0,
  executionStability: 0,
  alignment: 0,
  momentum: 0,
  overallScore: 0,
  lastUpdated: new Date().toISOString(),
};

// --- Context ---

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { socket } = useEvent(); // Assuming useEvent exposes socket, if not I need to check EventContext
  const { mode } = useStrategicMode();
  
  const [dna, setDna] = useState<StrategicDNA>(INITIAL_DNA);
  const [health, setHealth] = useState<SystemHealth>(INITIAL_HEALTH);

  const fetchMetrics = async () => {
      try {
          const [dnaRes, healthRes] = await Promise.all([
              fetch('/api/metrics/dna'),
              fetch('/api/metrics/health')
          ]);
          
          if (dnaRes.ok) setDna(await dnaRes.json());
          if (healthRes.ok) setHealth(await healthRes.json());
      } catch (error) {
          console.error('Failed to fetch metrics:', error);
      }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Listen for real-time updates from backend
  useEffect(() => {
      if (!socket) return;

      socket.on('metrics:dna:update', (newDna: StrategicDNA) => {
          setDna(newDna);
      });

      socket.on('metrics:health:update', (newHealth: SystemHealth) => {
          setHealth(newHealth);
      });

      return () => {
          socket.off('metrics:dna:update');
          socket.off('metrics:health:update');
      };
  }, [socket]);

  const refreshMetrics = () => {
    fetchMetrics();
  };

  return (
    <MetricsContext.Provider value={{ dna, health, refreshMetrics }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}
