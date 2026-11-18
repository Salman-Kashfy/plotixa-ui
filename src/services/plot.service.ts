import { apiUrl, constants, emptyMutationResponse } from '../utils/constants';
import { GET, POST, PUT, DELETE } from './api.service.wrapper';

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
    area: number;
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
    area: number;
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
