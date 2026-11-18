import { apiUrl, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export const GetBlocks = async (params: { projectUuid: string; [key: string]: any }) => {
    const response: any = await GET(apiUrl.blocks, params);
    return response?.status ? response.data : [];
};

export const UpsertBlock = async (data: { name: string; projectUuid: string; uuid?: string }) => {
    const response: any = await POST(apiUrl.blocks, data as any);
    return response || emptyMutationResponse;
};

export const DeletePlotBlock = async (id: string) => {
    const response: any = await POST(`${apiUrl.plotBlocks}/${id}/delete`);
    return response || emptyMutationResponse;
};
