import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type AlertSensitivity = 'normal' | 'alta';

interface PreferencesContextType {
    deepMode: boolean;
    alertSensitivity: AlertSensitivity;
    theme: 'light' | 'dark' | 'system';
    setDeepMode: (val: boolean) => void;
    setAlertSensitivity: (val: AlertSensitivity) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    savePreferences: (prefs: { deepMode?: boolean; alertSensitivity?: AlertSensitivity; theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
    isLoaded: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { user, getIdToken } = useAuth();
    const [deepMode, setDeepModeState] = useState(true);
    const [alertSensitivity, setAlertSensitivityState] = useState<AlertSensitivity>('normal');
    const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preferences from backend on login
    useEffect(() => {
        const load = async () => {
            if (!user) {
                setIsLoaded(true);
                return;
            }
            try {
                const token = await getIdToken();
                if (!token) return;
                const res = await fetch('/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.deepMode === 'boolean') setDeepModeState(data.deepMode);
                    if (data.alertSensitivity) setAlertSensitivityState(data.alertSensitivity as AlertSensitivity);
                    if (data.theme) setThemeState(data.theme);
                }
            } catch (e) {
                console.error('[PreferencesContext] Failed to load preferences:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        load();
    }, [user, getIdToken]);

    // Apply theme to document
    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            root.classList.remove('light', 'dark');
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(theme);
            }
        };

        applyTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme();
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const savePreferences = async (prefs: { deepMode?: boolean; alertSensitivity?: AlertSensitivity; theme?: 'light' | 'dark' | 'system' }) => {
        try {
            const token = await getIdToken();
            if (!token) return;
            await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(prefs),
            });
            if (typeof prefs.deepMode === 'boolean') setDeepModeState(prefs.deepMode);
            if (prefs.alertSensitivity) setAlertSensitivityState(prefs.alertSensitivity);
            if (prefs.theme) setThemeState(prefs.theme);
        } catch (e) {
            console.error('[PreferencesContext] Failed to save preferences:', e);
        }
    };

    const setTheme = (val: 'light' | 'dark' | 'system') => setThemeState(val);

    const setDeepMode = (val: boolean) => setDeepModeState(val);
    const setAlertSensitivity = (val: AlertSensitivity) => setAlertSensitivityState(val);

    return (
        <PreferencesContext.Provider value={{ deepMode, alertSensitivity, theme, setDeepMode, setAlertSensitivity, setTheme, savePreferences, isLoaded }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
    return ctx;
}
