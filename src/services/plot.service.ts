import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST, PUT, DELETE } from './api.service.wrapper';

// ─── Blocks ───────────────────────────────────────────────────────────────────

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

// ─── Plot Categories ──────────────────────────────────────────────────────────

export const GetPlotCategories = async (params: { projectUuid?: string } = {}) => {
    const response: any = await GET(apiUrl.plotCategories, params);
    return response?.status ? response.data : [];
};

export const CreatePlotCategory = async (data: { name: string; projectUuid: string }) => {
    const response: any = await POST(apiUrl.plotCategories, data as any);
    return response || emptyMutationResponse;
};

export const UpdatePlotCategory = async (id: string, data: { name: string; projectUuid: string }) => {
    const response: any = await POST(`${apiUrl.plotCategories}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeletePlotCategory = async (id: string) => {
    const response: any = await POST(`${apiUrl.plotCategories}/${id}/delete`);
    return response || emptyMutationResponse;
};

// ─── Plots ────────────────────────────────────────────────────────────────────

export const GetPlots = async (
    { page = 1, limit = constants.PER_PAGE },
    params: { projectUuid: string; [key: string]: any },
) => {
    const response: any = await GET(apiUrl.plots, { page, limit, ...params });
    return response?.status
        ? response.data
        : { list: [], pagination: { page: 1, perPage: limit, total: 0, totalPages: 0 } };
};

export const GetPlot = async (uuid: string, projectUuid: string) => {
    const response: any = await GET(`${apiUrl.plots}/${uuid}`, { projectUuid });
    return response?.status ? response.data : {};
};

export type CreatePlotPayload = {
    projectUuid: string;
    blockUuid: string;
    categoryUuid: string;
    startPlotNo: number;
    endPlotNo?: number;
    price: number;
};

export const CreatePlot = async (data: CreatePlotPayload) => {
    const response: any = await POST(apiUrl.plots, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response || emptyMutationResponse;
};

export type UpdatePlotPayload = {
    projectUuid: string;
    blockUuid: string;
    categoryUuid: string;
    price: number;
};

export const UpdatePlot = async (uuid: string, data: UpdatePlotPayload) => {
    const response: any = await PUT(`${apiUrl.plots}/${uuid}`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response || emptyMutationResponse;
};

export const DeletePlots = async (uuids: string[], projectUuid: string) => {
    const response: any = await DELETE(apiUrl.plots, { projectUuid }, {
        data: { uuids },
        headers: { 'Content-Type': 'application/json' },
    });
    return response || emptyMutationResponse;
};

export const DeletePlot = (uuid: string, projectUuid: string) => DeletePlots([uuid], projectUuid);
