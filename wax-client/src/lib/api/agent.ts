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


agent.interceptors.response.use(
   async response => {
        await sleep(1000);
        return response;
    },
    async error => {
        await sleep(1000);

        if (!error.response) {
            toast.error('No fue posible conectar con el servidor.');
            throw error;
        }

        const {status, data} = error.response;
        const requestUrl = error.config?.url as string | undefined;
        const isPassiveUserCheck = status === 401 && requestUrl?.includes('/account/user-info');
        const isBillingAddressCheck = requestUrl?.includes('/account/billing-address') && (status === 400 || status === 404);

        // Let React Query handle these silently - not actual errors for passive checks
        if (isPassiveUserCheck || isBillingAddressCheck) {
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
                toast.error('Unauthorized')
                break;
            default:
                break;
        }

        throw error;
    }
);

export default agent