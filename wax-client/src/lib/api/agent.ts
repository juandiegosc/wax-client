import axios from "axios";
import { toast } from "react-toastify";
import { router } from "../../app/router/routes";

const apiUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api" : "http://localhost:5005/api");

const sleep = (delay: number) =>{
    return new Promise(resolve=>{
        setTimeout(resolve, delay)
    }) 
}

const agent = axios.create({
    baseURL: apiUrl,
    withCredentials: true //allows cookies from backend
});

const isBillingAddressFalseNegative = (requestUrl: string | undefined, status: number, data: unknown) => {
    return requestUrl?.includes('/account/billing-address')
        && status === 400
        && data === 'Failed to save billing address';
};

const isSilentPassiveCheck = (requestUrl: string | undefined, requestMethod: string | undefined, status: number, data: unknown): boolean => {
    if (status === 401 && requestUrl?.includes('/account/user-info')) return true;
    if (requestUrl?.includes('/account/billing-address') && (status === 400 || status === 404)) return true;
    if (isBillingAddressFalseNegative(requestUrl, status, data)) return true;
    // GET /basket can legitimately return 400/404 when the user has no basket yet
    if (requestUrl?.includes('/basket') && requestMethod === 'get' && (status === 400 || status === 404)) return true;
    return false;
};


agent.interceptors.response.use(
   async response => {
        await sleep(1000);
        return response;
    },
    async error => {
        await sleep(1000);

        if (!error.response) {
            toast.error('No pudimos conectar con el servidor.');
            throw error;
        }

        const {status, data} = error.response;
        const requestUrl = error.config?.url as string | undefined;
        const requestMethod = error.config?.method?.toLowerCase();

        // Let React Query handle these silently - not actual errors for passive checks
        if (isSilentPassiveCheck(requestUrl, requestMethod, status, data)) {
            throw error;
        }

        switch (status) {
            case 400:
                if(data.errors){
                    const modalStateErrors = [];
                    for(const key in data.errors){
                        if(data.errors[key]){
                            modalStateErrors.push(data.errors[key]);
                        }
                    }
                    throw modalStateErrors.flat();
                }
                else{
                    toast.error(data);
                }
                break;
            case 404:
                router.navigate('/not-found');
                break;
            case 500:
                router.navigate('/server-error', {state:{error: data}})
                break;
            case 401:
                toast.error('No tienes permiso para realizar esta acción.');
                break;
            default:
                break;
        }

        throw error;
    }
);

export default agent