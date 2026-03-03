
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Decision, Risk, ExecutionPlan, StrategicSession } from '../types';
import { mockService } from '../services/mockService';
import { useAuth } from './AuthContext';

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
  const { user: firebaseUser, getIdToken } = useAuth();
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
      // Fetch user profile from backend if authenticated
      if (firebaseUser) {
        const token = await getIdToken();
        if (token) {
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const profileData = await response.json();
            setHasCompletedOnboarding(profileData.hasCompletedOnboarding || false);
            
            // Map backend profile to User type
            const userData: User = {
              id: profileData.id,
              name: profileData.name || 'User',
              email: profileData.email,
              company: 'Company',
              role: 'User',
              objective: profileData.objective || '',
              plan: profileData.plan || 'gratis',
              preferences: {
                strategicMode: profileData.strategicMode || 'equilibrado',
                deepMode: true,
                alertSensitivity: 'normal',
              },
            };
            setUser(userData);
          }
        }
      }

      // Fetch mock data for decisions, risks, plans, sessions
      const [decisionsData, risksData, plansData, sessionsData] = await Promise.all([
        mockService.getDecisions(),
        mockService.getRisks(),
        mockService.getPlans(),
        mockService.getSessions(),
      ]);

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
    if (firebaseUser) {
      refreshData();
    } else {
      setIsLoading(false);
      setHasCompletedOnboarding(false);
      setUser(null);
    }
  }, [firebaseUser]);

  const updateUser = async (updatedUser: Partial<User>) => {
    try {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const token = await getIdToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Map User partial to backend format
      const updateData: any = {};
      if (updatedUser.name) updateData.name = updatedUser.name;
      if (updatedUser.objective) updateData.objective = updatedUser.objective;
      if (updatedUser.preferences?.strategicMode) updateData.strategicMode = updatedUser.preferences.strategicMode;

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const profileData = await response.json();
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          name: profileData.name || user.name,
          objective: profileData.objective || user.objective,
          preferences: {
            ...user.preferences,
            strategicMode: profileData.strategicMode || user.preferences.strategicMode,
          },
        });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
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
      
      if (!firebaseUser) {
        console.error('[AppContext] Erro: usuário não autenticado');
        throw new Error('User not authenticated');
      }
      console.log('[AppContext] Firebase user OK:', firebaseUser.uid);

      console.log('[AppContext] Obtendo token...');
      const token = await getIdToken();
      if (!token) {
        console.error('[AppContext] Erro: token não obtido');
        throw new Error('Failed to get authentication token');
      }
      console.log('[AppContext] Token obtido com sucesso');

      // Update user profile in backend
      console.log('[AppContext] Enviando PATCH para /api/user/profile...');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasCompletedOnboarding: true,
          objective,
          strategicMode: mode,
        }),
      });

      console.log('[AppContext] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AppContext] Response error:', errorText);
        throw new Error(`Failed to update user profile: ${response.status} ${errorText}`);
      }

      const updatedProfile = await response.json();
      console.log('[AppContext] Perfil atualizado:', updatedProfile);

      // Update local state
      setHasCompletedOnboarding(true);
      if (user) {
        setUser({
          ...user,
          objective: updatedProfile.objective,
          preferences: {
            ...user.preferences,
            strategicMode: updatedProfile.strategicMode,
          },
        });
      }

      console.log('[AppContext] Onboarding completado com sucesso');
    } catch (error) {
      console.error('[AppContext] Erro ao completar onboarding:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      refreshData();
    } else {
      setIsLoading(false);
      setHasCompletedOnboarding(false);
      setUser(null);
    }
  }, [firebaseUser]);

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
