import {constants, apiUrl} from '../../utils/constants';
import {POST,GET} from '../api.service.wrapper';

const storageKey = constants.LOCAL_STORAGE_TOKEN;
const storageAdmin = constants.LOCAL_STORAGE_ADMIN;
const storagePermissions = constants.LOCAL_STORAGE_PERMISSIONS;
let authUser , userPermissions

interface AdminLoginInterface {
    email: string,
    password: string,
}

export const AdminLogin = async (data:AdminLoginInterface) => {
    const response = await POST(apiUrl.adminLogin, data);
    if(response.status){
        SetToken(response.token);
        SetAuthUser(response.admin);
    }
    return response;
}

export const SetToken = (token) => {
    if (token) localStorage.setItem(storageKey, token);
    else localStorage.removeItem(storageKey);
}

export const SetPermissions = (permissions) => {
    if (permissions) {
        userPermissions = permissions
        localStorage.setItem(storagePermissions, JSON.stringify(permissions))
    }
    else localStorage.removeItem(storagePermissions);
}

export const GetPermissions = () => {
    return JSON.parse(localStorage.getItem(storagePermissions));
}

export const GetToken = () => {
    return localStorage.getItem(storageKey);
}

export const SetAuthUser = (user_data) => {
    if (user_data) {
        authUser = user_data
        localStorage.setItem(storageAdmin, JSON.stringify(user_data))
    }
    else localStorage.removeItem(storageAdmin);
}

export const GetAuthUser = () => {
    return authUser || JSON.parse(localStorage.getItem(storageAdmin));
}

export const GetUserPermissions = () => {
    return userPermissions || JSON.parse(localStorage.getItem(storagePermissions)) || []
}

export const UserPermissions = async () => {
    const response = await GET(apiUrl.userPermissions);
    if(response.status){
        SetPermissions(response.data)
    }
    return response;
}

export const Logout = async () => {
    const response = await POST(apiUrl.logout);
    authUser = null
    userPermissions = null
    return response;
}

export const EmptyLocalStorage = async () => {
    await localStorage.removeItem(storageAdmin);
    await localStorage.removeItem(storageKey)
    return await localStorage.removeItem(storagePermissions)
}

export const GetUserRole = () => {
    const user = GetAuthUser();
    if(!user?.role) return false
    return user?.role.name.toLowerCase();
}
