import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

// ─── Plot Blocks ──────────────────────────────────────────────────────────────

export const GetPlotBlocks = async (params = {}) => {
    const response: any = await GET(apiUrl.plotBlocks, params);
    return response?.status ? response.data : [];
};

export const CreatePlotBlock = async (data: { name: string }) => {
    const response: any = await POST(apiUrl.plotBlocks, data as any);
    return response || emptyMutationResponse;
};

export const UpdatePlotBlock = async (id: string, data: { name: string }) => {
    const response: any = await POST(`${apiUrl.plotBlocks}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeletePlotBlock = async (id: string) => {
    const response: any = await POST(`${apiUrl.plotBlocks}/${id}/delete`);
    return response || emptyMutationResponse;
};

// ─── Plot Categories ──────────────────────────────────────────────────────────

export const GetPlotCategories = async (params = {}) => {
    const response: any = await GET(apiUrl.plotCategories, params);
    return response?.status ? response.data : [];
};

export const CreatePlotCategory = async (data: { name: string }) => {
    const response: any = await POST(apiUrl.plotCategories, data as any);
    return response || emptyMutationResponse;
};

export const UpdatePlotCategory = async (id: string, data: { name: string }) => {
    const response: any = await POST(`${apiUrl.plotCategories}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeletePlotCategory = async (id: string) => {
    const response: any = await POST(`${apiUrl.plotCategories}/${id}/delete`);
    return response || emptyMutationResponse;
};

// ─── Plots ────────────────────────────────────────────────────────────────────

export const GetPlots = async ({ page = 1, limit = constants.PER_PAGE }, params = {}) => {
    const response: any = await GET(apiUrl.plots, { page, limit, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetPlot = async (id: string) => {
    const response: any = await GET(`${apiUrl.plots}/${id}`);
    return response?.status ? response.data : {};
};

export const CreatePlot = async (data: { blockId: string; categoryId: string; noOfPlots: number }) => {
    const response: any = await POST(apiUrl.plots, data as any);
    return response || emptyMutationResponse;
};

export const UpdatePlot = async (id: string, data: { blockId: string; categoryId: string }) => {
    const response: any = await POST(`${apiUrl.plots}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeletePlot = async (id: string) => {
    const response: any = await POST(`${apiUrl.plots}/${id}/delete`);
    return response || emptyMutationResponse;
};
