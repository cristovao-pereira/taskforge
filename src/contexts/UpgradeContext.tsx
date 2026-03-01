import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// --- Types ---

export type UpgradeTriggerType = 
  | 'credits_low' 
  | 'deep_mode_locked' 
  | 'strategic_upsell' 
  | 'processing_blocked' 
  | null;

export interface UsageMetrics {
  creditsUsedPercent: number;
  deepModeAttempts: number;
  weeklySessions: number;
  activeExecutionPlans: number;
  strategicHealthScore: number;
  plan: 'free' | 'builder' | 'strategic';
}

interface UpgradeContextType {
  metrics: UsageMetrics;
  activeTrigger: UpgradeTriggerType;
  showModal: boolean;
  checkUpgradeTriggers: (action?: string) => void;
  dismissUpgradePrompt: () => void;
  trackUpgradeEvent: (event: string, details?: any) => void;
  updateMetrics: (newMetrics: Partial<UsageMetrics>) => void;
}

// --- Context ---

const UpgradeContext = createContext<UpgradeContextType | undefined>(undefined);

// --- Mock Data ---
// In a real app, this would come from your backend based on the userId
const MOCK_INITIAL_METRICS: UsageMetrics = {
  creditsUsedPercent: 45,
  deepModeAttempts: 0,
  weeklySessions: 2,
  activeExecutionPlans: 1,
  strategicHealthScore: 65,
  plan: 'free' // Default to free for testing
};

export const UpgradeProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<UsageMetrics>(MOCK_INITIAL_METRICS);
  const [activeTrigger, setActiveTrigger] = useState<UpgradeTriggerType>(null);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  // Reset triggers on route change (optional, depending on desired persistence)
  useEffect(() => {
    // We might want to keep banners across routes, but modals usually close
    setShowModal(false);
  }, [location.pathname]);

  // Central Function: Check Logic
  const checkUpgradeTriggers = (action?: string) => {
    // 1. Deep Mode Attempt on Free
    if (action === 'attempt_deep_mode' && metrics.plan === 'free') {
      setActiveTrigger('deep_mode_locked');
      setShowModal(true);
      trackUpgradeEvent('trigger_activated', { type: 'deep_mode_locked' });
      return;
    }

    // 2. High Credit Usage (80%+) - Banner
    if (metrics.creditsUsedPercent >= 80 && metrics.creditsUsedPercent < 100) {
      if (activeTrigger !== 'credits_low') {
        setActiveTrigger('credits_low');
        // This is a banner, so no modal
        trackUpgradeEvent('trigger_activated', { type: 'credits_low' });
      }
      return;
    }

    // 3. Consistent Advanced Usage - Upsell to Strategic
    // Triggers if: 4+ sessions/week OR 3+ plans active AND high health score
    if ((metrics.weeklySessions >= 4 || metrics.activeExecutionPlans >= 3) && metrics.strategicHealthScore > 75) {
      if (metrics.plan !== 'strategic') { // Don't upsell if already on top tier
         setActiveTrigger('strategic_upsell');
         // Could be banner or modal. Let's start with banner for less intrusion, or modal for "milestone" feel.
         // Request says: "Exibir: Você está operando em nível estratégico elevado..."
         // Let's use a banner for this one as per "Contextual, non-aggressive"
         trackUpgradeEvent('trigger_activated', { type: 'strategic_upsell' });
         return;
      }
    }

    // 4. Processing Blocked (100% credits or specific feature)
    if (action === 'process_advanced' && metrics.plan === 'free') {
        setActiveTrigger('processing_blocked');
        setShowModal(true); // Blocking action usually requires modal
        trackUpgradeEvent('trigger_activated', { type: 'processing_blocked' });
        return;
    }

    // Default: No activation
  };

  const dismissUpgradePrompt = () => {
    setShowModal(false);
    setActiveTrigger(null);
  };

  const trackUpgradeEvent = (event: string, details?: any) => {
    console.log(`[UpgradeAnalytics] ${event}`, details);
    // Here you would call your analytics service (e.g., PostHog, Mixpanel, creating a DB record)
  };

  const updateMetrics = (newMetrics: Partial<UsageMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  // Run check on mount (Dashboard entry simulation)
  useEffect(() => {
    checkUpgradeTriggers();
  }, []); // Run once on mount

  return (
    <UpgradeContext.Provider value={{
      metrics,
      activeTrigger,
      showModal,
      checkUpgradeTriggers,
      dismissUpgradePrompt,
      trackUpgradeEvent,
      updateMetrics
    }}>
      {children}
    </UpgradeContext.Provider>
  );
};

export const useUpgrade = () => {
  const context = useContext(UpgradeContext);
  if (context === undefined) {
    throw new Error('useUpgrade must be used within an UpgradeProvider');
  }
  return context;
};
