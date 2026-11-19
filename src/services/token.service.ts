import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export type TokenStatus = 'ACTIVE' | 'EXPIRED' | 'CONVERTED' | 'REFUNDED';

export type UpsertTokenRequest = {
    projectUuid: string;
    plotUuid: string;
    customerUuid: string;
    amount: number;
    status?: TokenStatus;
    uuid?: string;
    validForDays?: number;
};

export const GetTokens = async (
    { page = 1, perPage = constants.PER_PAGE },
    projectUuid: string,
    params: { status?: TokenStatus } = {},
) => {
    const response: any = await GET(apiUrl.tokens, { projectUuid, page, perPage, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetToken = async (uuid: string, projectUuid: string) => {
    const response: any = await GET(`${apiUrl.tokens}/${encodeURIComponent(uuid)}`, { projectUuid });
    return response?.status ? response.data : {};
};

export const UpsertToken = async (data: UpsertTokenRequest) => {
    const response: any = await POST(apiUrl.tokens, data);
    return response || emptyMutationResponse;
};

export const CreateToken = UpsertToken;
export const UpdateToken = UpsertToken;
