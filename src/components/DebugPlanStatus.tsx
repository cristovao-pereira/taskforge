import { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function DebugPlanStatus() {
  const { getIdToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDebug = async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setDebugInfo({ error: 'Erro de autenticação' });
        return;
      }

      const response = await fetch('/api/billing/debug', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 border border-red-900/50 bg-red-900/10 rounded-lg p-4">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !debugInfo) {
            handleDebug();
          }
        }}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors"
      >
        <AlertCircle className="w-4 h-4" />
        <span>Diagnóstico de Sincronização</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 text-sm">
          {isLoading ? (
            <div className="text-zinc-400">Carregando...</div>
          ) : debugInfo ? (
            <>
              <div className="bg-black/30 p-3 rounded font-mono text-xs whitespace-pre-wrap break-words overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </div>
              
              {debugInfo.database && debugInfo.stripe && (
                <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                  <div className="text-yellow-300 font-medium mb-2">Análise:</div>
                  <ul className="text-yellow-200 space-y-1 text-xs">
                    <li>✓ FirebaseUID: {debugInfo.firebaseUid?.substring(0, 8)}...</li>
                    <li>✓ Usuário encontrado no DB</li>
                    <li>📊 Plano no DB: <strong>{debugInfo.database.plan}</strong></li>
                    <li>💳 Stripe ID: {debugInfo.database.stripeCustomerId ? '✓' : '❌'}</li>
                    {debugInfo.stripe?.priceId && (
                      <li>💰 Subscription ativa no Stripe: <strong>{debugInfo.stripe.priceId}</strong></li>
                    )}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
