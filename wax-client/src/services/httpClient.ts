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

httpClient.interceptors.response.use(
  async (response) => {
    await sleep(300);
    return response;
  },
  async (error) => {
    await sleep(300);

    const status = error.response?.status as number | undefined;
    const data = error.response?.data;

    switch (status) {
      case 400:
        if (data?.errors) {
          const modelStateErrors: string[] = [];

          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(...data.errors[key]);
            }
          }

          throw modelStateErrors;
        }

        toast.error(typeof data === 'string' ? data : 'Solicitud invalida');
        break;
      case 401:
        toast.error('No autorizado');
        break;
      case 404:
        router.navigate(routePaths.notFound);
        break;
      case 500:
        router.navigate(routePaths.serverError, { state: { error: data } });
        break;
      default:
        break;
    }

    throw error instanceof Error ? error : new Error('Error de solicitud HTTP');
  },
);