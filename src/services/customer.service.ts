import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export const GetCustomers = async ({ page = 1, limit = constants.PER_PAGE }, params = {}) => {
    const response: any = await GET(apiUrl.customers, { page, limit, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetCustomer = async (id: string) => {
    const response: any = await GET(`${apiUrl.customers}/${id}`);
    return response?.status ? response.data : {};
};

export const CreateCustomer = async (data: { name: string; phoneCode: string; phoneNumber: string }) => {
    const response: any = await POST(apiUrl.customers, data as any);
    return response || emptyMutationResponse;
};

export const UpdateCustomer = async (id: string, data: { name: string; phoneCode: string; phoneNumber: string }) => {
    const response: any = await POST(`${apiUrl.customers}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeleteCustomer = async (id: string) => {
    const response: any = await POST(`${apiUrl.customers}/${id}/delete`);
    return response || emptyMutationResponse;
};
