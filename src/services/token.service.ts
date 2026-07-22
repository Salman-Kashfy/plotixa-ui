import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export const GetTokens = async ({ page = 1, limit = constants.PER_PAGE }, params = {}) => {
    const response: any = await GET(apiUrl.tokens, { page, limit, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetToken = async (id: string) => {
    const response: any = await GET(`${apiUrl.tokens}/${id}`);
    return response?.status ? response.data : {};
};

export const CreateToken = async (data: { customerId: string; plotId: string; amount: number }) => {
    const response: any = await POST(apiUrl.tokens, data as any);
    return response || emptyMutationResponse;
};

export const UpdateToken = async (id: string, data: { customerId: string; plotId: string; amount: number }) => {
    const response: any = await POST(`${apiUrl.tokens}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeleteToken = async (id: string) => {
    const response: any = await POST(`${apiUrl.tokens}/${id}/delete`);
    return response || emptyMutationResponse;
};
