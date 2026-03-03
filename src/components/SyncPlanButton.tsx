import { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function SyncPlanButton() {
  const { getIdToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Erro de autenticação');
        return;
      }

      const response = await fetch('/api/billing/sync-plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Erro ao sincronizar plano');
        return;
      }

      if (data.status === 'updated') {
        toast.success(data.message);
      } else if (data.status === 'synchronized') {
        toast.success('Plano já estava sincronizado ✓');
      } else if (data.status === 'no-active-subscription') {
        toast.info('Nenhuma subscription ativa encontrada');
      } else if (data.status === 'no-customer') {
        toast.info('Usuário não tem Customer ID no Stripe');
      }

    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro ao sincronizar plano');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      title="Se seu plano não está refletindo corretamente, clique para sincronizar com Stripe"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Sincronizando...' : 'Sincronizar Plano'}
    </button>
  );
}
