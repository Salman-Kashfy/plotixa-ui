import {api} from './api.service'
import {constants, apiUrl, ERROR_CODES, ROUTES} from "../utils/constants";
import {first,isEmpty,isArray} from "lodash";
import {AxiosRequestConfig} from "axios";
import {EmptyLocalStorage, SetToken} from "./auth/auth.service";

const fakeResponses = import.meta.glob('../../responses/*.json');

const getFakeResponse = async (url: string) => {
    const slug = url.replace(/^\/+/, '').replace(/\//g, '-');
    const key = `../../responses/${slug}.json`;
    const loader = fakeResponses[key];
    if (!loader) {
        console.warn(`[FAKE] No mock found for "${url}" (looked for ${slug}.json)`);
        return { status: false, message: `No fake response for: ${url}` };
    }
    const mod = await loader() as { default: unknown };
    console.info(`[FAKE] Returning mock for: ${url}`);
    return mod.default;
};

export const SetBaseUrl = () => {
    return constants.API_URL;
}

export const POST = async (url, data = null, config = {}) => {
    if (constants.FAKE_RESPONSE) return getFakeResponse(url);
    try {
        const res = await api.post(url, data, { ...config, withCredentials: true } as AxiosRequestConfig);
        if(res?.data?.data && Object.keys(res?.data?.data).length){
            const key = first(Object.keys(res?.data?.data))
            if(!isEmpty(res?.data?.data[key].errors)){
                if(res?.data?.data[key].errors.includes(ERROR_CODES.NOT_ALLOWED)){
                    window.location.href = constants.APP_URL + ROUTES.FORBIDDEN
                }
            }
        }
        if(isArray(res?.data?.errors)){
            const error = first(res?.data?.errors)
            if(error?.extensions?.code === 'SUBSCRIPTION_EXPIRED'){
                await EmptyLocalStorage()
                window.location.href = constants.APP_URL
            }
        }
        return res?.data;
    } catch (e) {
        if (e?.response.status === 400) {
            const error = first(e.response.data.errors);
            if (error.extensions.code === 'UNAUTHENTICATED') {
                try {
                    const refreshRes = await api.post(SetBaseUrl() + apiUrl.refreshToken, {}, { ...config, withCredentials: true } as AxiosRequestConfig);
                    if (refreshRes?.data.status) {
                        SetToken(refreshRes?.data.token);
                        const retryRes = await api.post(url, data, { ...config, withCredentials: true } as AxiosRequestConfig);
                        return retryRes?.data;
                    }
                } catch (e) {
                    if(e?.response?.status === 401){
                        await EmptyLocalStorage()
                        window.location.href = constants.APP_URL
                    }else{
                        console.log(e);
                    }
                }
            } else if(error.extensions.code === 'SUBSCRIPTION_EXPIRED'){
                await EmptyLocalStorage()
                window.location.href = constants.APP_URL
            }
        }
    }
};

export const GET = async (url, params = {}, config = {}) => {
    if (constants.FAKE_RESPONSE) return getFakeResponse(url);
    try {
        const res = await api.get(url, { ...config, withCredentials: true, params } as AxiosRequestConfig);
        if(res?.data?.data && Object.keys(res?.data?.data).length){
            const key = first(Object.keys(res?.data?.data))
            if(!isEmpty(res?.data?.data[key].errors)){
                if(res?.data?.data[key].errors.includes(ERROR_CODES.NOT_ALLOWED)){
                    window.location.href = constants.APP_URL + ROUTES.FORBIDDEN
                }
            }
        }
        return res?.data;
    } catch (e) {
        if (e?.response.status === 401) {
            try {
                const refreshRes = await api.post(SetBaseUrl() + apiUrl.refreshToken, {}, { ...config, withCredentials: true } as AxiosRequestConfig);
                if (refreshRes?.data.status) {
                    SetToken(refreshRes?.data.token);
                    const res = await api.get(url, { ...config, withCredentials: true, params } as AxiosRequestConfig);
                    return res?.data;
                }
            } catch (e) {
                if(e?.response?.status === 401){
                    await EmptyLocalStorage()
                    window.location.href = constants.APP_URL
                }else{
                    console.log(e);
                }
            }
        }
    }
};


