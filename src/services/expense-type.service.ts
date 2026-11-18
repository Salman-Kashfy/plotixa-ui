import { apiUrl, emptyMutationResponse } from '../utils/constants';
import { GET, POST, DELETE } from './api.service.wrapper';

export const GetExpenseTypes = async (params: { projectUuid: string; [key: string]: any }) => {
    const response: any = await GET(apiUrl.expenseTypes, params);
    return response?.status ? response.data : [];
};

export const UpsertExpenseType = async (data: { name: string; projectUuid: string; uuid?: string }) => {
    const response: any = await POST(apiUrl.expenseTypes, data as any);
    console.log({response});
    return response || emptyMutationResponse;
};

export const DeleteExpenseType = async (uuid: string, projectUuid: string) => {
    const response: any = await DELETE(`${apiUrl.expenseTypes}/${uuid}`, { projectUuid });
    return response || emptyMutationResponse;
};
