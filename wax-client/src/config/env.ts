const requiredEnv = {
  apiUrl: import.meta.env.VITE_API_URL,
};

export const env = {
  apiUrl: requiredEnv.apiUrl ?? 'http://localhost:5005/api',
};