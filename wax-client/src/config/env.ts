const requiredEnv = {
  apiUrl: import.meta.env.VITE_API_URL,
  n8nUrl: import.meta.env.VITE_N8N_URL,
  stripePk: import.meta.env.VITE_STRIPE_PK_KEY,
};

const apiBase = ((requiredEnv.apiUrl as string | undefined) ?? 'http://localhost:5005/api').replace(/\/api$/, '');

export const env = {
  apiUrl: `${apiBase}/api`,
  supportHubUrl: `${apiBase}/comments`,
  n8nUrl: (requiredEnv.n8nUrl as string | undefined) ?? 'http://localhost:5678/webhook',
  stripePk: (requiredEnv.stripePk as string | undefined) ?? '',
};