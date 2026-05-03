const requiredEnv = {
  apiUrl: import.meta.env.VITE_API_URL,
  n8nUrl: import.meta.env.VITE_N8N_URL,
  stripePk: import.meta.env.VITE_STRIPE_PK_KEY,
};

export const env = {
  apiUrl: requiredEnv.apiUrl ?? 'http://localhost:5005/api',
  n8nUrl: (requiredEnv.n8nUrl as string | undefined) ?? 'http://localhost:5678/webhook',
  stripePk: (requiredEnv.stripePk as string | undefined) ?? '',
};