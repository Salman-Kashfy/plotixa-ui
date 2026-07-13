import {api} from './api.service'
import {constants,apiUrl,ERROR_CODES} from "../utils/constants";
import {first,isEmpty} from "lodash";
import {AxiosRequestConfig} from "axios";
import {EmptyLocalStorage, SetToken} from "./auth/auth.service";
import {SetBaseUrl} from "./api.service.wrapper";

export const _POST = async (url, data = null, config = {}) => {
    try {
        const res = await api.post(url, data, { ...config, withCredentials: true } as AxiosRequestConfig);
        if(res?.data?.data && Object.keys(res?.data?.data).length){
            const key = first(Object.keys(res?.data?.data))
            if(!isEmpty(res?.data?.data[key].errors)){
                if(res?.data?.data[key].errors.includes(ERROR_CODES.NOT_ALLOWED)){
                    window.location.href = constants.APP_URL + '/not-found'
                }
            }
        }
        return res?.data;
    } catch (e) {
        if (e.status === 401) {
            try {
                const refreshRes = await api.post(SetBaseUrl() + apiUrl.refreshToken, {}, { ...config, withCredentials: true } as AxiosRequestConfig);
                if (refreshRes?.data.status) {
                    SetToken(refreshRes?.data.token);
                    const retryRes = await api.post(url, data, { ...config, withCredentials: true } as AxiosRequestConfig);
                    return retryRes?.data;
                }
            } catch (e) {
                if(e.status === 401){
                    await EmptyLocalStorage()
                    window.location.href = constants.APP_URL
                }else{
                    console.log(e);
                }
            }
        }
    }
};

export const _GET = async (url, params = {}, config = {}) => {
    try {
        const res = await api.get(url, { ...config, withCredentials: true, params } as AxiosRequestConfig);
        if(res?.data?.data && Object.keys(res?.data?.data).length){
            const key = first(Object.keys(res?.data?.data))
            if(!isEmpty(res?.data?.data[key].errors)){
                if(res?.data?.data[key].errors.includes(ERROR_CODES.NOT_ALLOWED)){
                    window.location.href = constants.APP_URL + '/not-found'
                }
            }
        }
        return res?.data;
    } catch (e) {
        if (e.status === 401) {
            try {
                const refreshRes = await api.post(SetBaseUrl() + apiUrl.refreshToken, {}, { ...config, withCredentials: true } as AxiosRequestConfig);
                if (refreshRes?.data.status) {
                    SetToken(refreshRes?.data.token);
                    const res = await api.get(url, { ...config, withCredentials: true, params } as AxiosRequestConfig);
                    return res?.data;
                }
            } catch (e) {
                if(e.status === 401){
                    await EmptyLocalStorage()
                    window.location.href = constants.APP_URL
                }else{
                    console.log(e);
                }
            }
        }
    }
};


