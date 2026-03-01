
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Decision, Risk, ExecutionPlan, StrategicSession } from '../types';
import { mockService } from '../services/mockService';

interface AppContextType {
  user: User | null;
  decisions: Decision[];
  risks: Risk[];
  plans: ExecutionPlan[];
  sessions: StrategicSession[];
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  refreshData: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  addDecision: (decision: Omit<Decision, 'id' | 'date'>) => Promise<void>;
  resolveRisk: (id: string) => Promise<void>;
  completeOnboarding: (objective: string, mode: 'conservador' | 'equilibrado' | 'expansao') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [plans, setPlans] = useState<ExecutionPlan[]>([]);
  const [sessions, setSessions] = useState<StrategicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [userData, decisionsData, risksData, plansData, sessionsData] = await Promise.all([
        mockService.getUser(),
        mockService.getDecisions(),
        mockService.getRisks(),
        mockService.getPlans(),
        mockService.getSessions(),
      ]);

      setUser(userData);
      setDecisions(decisionsData);
      setRisks(risksData);
      setPlans(plansData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateUser = async (updatedUser: Partial<User>) => {
    try {
      const newUser = await mockService.updateUser(updatedUser);
      setUser(newUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const addDecision = async (decision: Omit<Decision, 'id' | 'date'>) => {
    try {
      const newDecision = await mockService.createDecision(decision);
      setDecisions(prev => [newDecision, ...prev]);
    } catch (error) {
      console.error('Failed to add decision:', error);
    }
  };

  const resolveRisk = async (id: string) => {
    try {
      await mockService.resolveRisk(id);
      setRisks(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    } catch (error) {
      console.error('Failed to resolve risk:', error);
    }
  };

  const completeOnboarding = async (objective: string, mode: 'conservador' | 'equilibrado' | 'expansao') => {
    try {
      console.log('[AppContext] Iniciando completeOnboarding:', { objective, mode });
      
      // Update user with objective
      const updatedUser = await mockService.updateUser({ objective });
      setUser(updatedUser);
      console.log('[AppContext] Usuário atualizado:', updatedUser);
      
      // Save mode to backend (will be persisted via StrategicContext)
      await fetch('/api/user/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }).catch(() => {
        // Fail silently if no backend endpoint
        console.log('Mode will be saved locally');
      });

      setHasCompletedOnboarding(true);
      localStorage.setItem('onboarding_completed', 'true');
      console.log('[AppContext] Onboarding completado e salvo no localStorage');
    } catch (error) {
      console.error('[AppContext] Erro ao completar onboarding:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setHasCompletedOnboarding(completed);
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      decisions,
      risks,
      plans,
      sessions,
      isLoading,
      hasCompletedOnboarding,
      refreshData,
      updateUser,
      addDecision,
      resolveRisk,
      completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
