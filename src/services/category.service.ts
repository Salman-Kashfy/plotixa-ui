import { apiUrl, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export const GetCategories = async (params: { projectUuid?: string } = {}) => {
    const response: any = await GET(apiUrl.categories, params);
    return response?.status ? response.data : [];
};

export const CreateCategory = async (data: { name: string; projectUuid: string }) => {
    const response: any = await POST(apiUrl.categories, data as any);
    return response || emptyMutationResponse;
};

export const UpdateCategory = async (uuid: string, data: { name: string; projectUuid: string }) => {
    const response: any = await POST(apiUrl.categories, { ...data, uuid });
    return response || emptyMutationResponse;
};

export const DeleteCategory = async (id: string) => {
    const response: any = await POST(`${apiUrl.categories}/${id}/delete`);
    return response || emptyMutationResponse;
};
