import axios, {AxiosRequestConfig, InternalAxiosRequestConfig} from "axios";
import {constants} from '../utils/constants'
import {GetToken} from "./auth/auth.service";

axios.defaults.baseURL = constants.API_URL;
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export const axiosService = axios;

export const api = axios.create({
    timeout: 60 * 1000
} as AxiosRequestConfig);

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let token = GetToken();
        return {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            },
        };
    },
    (exc) => Promise.reject(exc)
);
