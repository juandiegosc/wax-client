import axios from 'axios';
import { toast } from 'react-toastify';
import { env } from '@/config/env';
import { routePaths } from '@/routes/routePaths';
import { router } from '@/routes/router';

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

const isSilentPassiveCheck = (
  requestUrl: string | undefined,
  requestMethod: string | undefined,
  status: number | undefined,
): boolean => {
  // GET /basket can legitimately return 400/404 when the user has no basket yet
  return Boolean(
    requestUrl?.includes('/basket') &&
    requestMethod === 'get' &&
    (status === 400 || status === 404),
  );
};

const handleBadRequest = (data: unknown): void => {
  if (data && typeof data === 'object' && 'errors' in data) {
    const errors = (data as { errors: Record<string, string[] | undefined> }).errors;
    const modelStateErrors: string[] = [];
    for (const key in errors) {
      if (errors[key]) modelStateErrors.push(...errors[key]);
    }
    throw modelStateErrors;
  }
  toast.error(typeof data === 'string' ? data : 'Solicitud invalida');
};

const handleHttpError = (status: number | undefined, data: unknown): void => {
  switch (status) {
    case 400: handleBadRequest(data); break;
    case 401: toast.error('No autorizado'); break;
    case 404: router.navigate(routePaths.notFound); break;
    case 500: router.navigate(routePaths.serverError, { state: { error: data } }); break;
    default: break;
  }
};

httpClient.interceptors.response.use(
  async (response) => {
    await sleep(300);
    return response;
  },
  async (error) => {
    await sleep(300);

    const status = error.response?.status as number | undefined;
    const data = error.response?.data;
    const requestUrl = error.config?.url as string | undefined;
    const requestMethod = error.config?.method?.toLowerCase();

    // Let callers handle these silently — not real errors
    if (!isSilentPassiveCheck(requestUrl, requestMethod, status)) {
      handleHttpError(status, data);
    }

    throw error instanceof Error ? error : new Error('Error de solicitud HTTP');
  },
);