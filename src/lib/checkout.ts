import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  priceId: string,
  mode: 'subscription' | 'payment' = 'subscription'
): Promise<{ sessionId: string; url: string }> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/api/checkout/create-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      priceId,
      mode,
      successUrl: `${window.location.origin}/app/billing?success=true`,
      cancelUrl: `${window.location.origin}/app/billing?canceled=true`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const backendMessage = error?.message || '';

    if (
      response.status === 503 ||
      backendMessage.toLowerCase().includes('stripe não configurado') ||
      backendMessage.toLowerCase().includes('stripe authentication failed') ||
      backendMessage.toLowerCase().includes('invalid api key')
    ) {
      throw new Error('Pagamento indisponível no momento: Stripe não configurado corretamente no servidor.');
    }

    throw new Error(backendMessage || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Get user subscription status and credits
 */
export async function getSubscriptionStatus(): Promise<{
  credits: number;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    priceId: string;
    productId?: string;
    plan?: 'essencial' | 'profissional' | 'estrategico' | null;
  } | null;
}> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/api/billing/subscription`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch subscription status');
  }

  return response.json();
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  priceId: string,
  mode: 'subscription' | 'payment' = 'subscription'
): Promise<void> {
  try {
    const { url } = await createCheckoutSession(priceId, mode);
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}
