import { apiUrl, constants } from '../utils/constants';
import { GET } from './api.service.wrapper';

export type Payment = {
    uuid: string;
    type: string;
    status: string;
    amount: string;
    createdAt: string;
    updatedAt: string;
    plot?: {
        uuid: string;
        plotNo: number;
    };
    customer?: {
        uuid: string;
        firstName: string;
        lastName: string;
    };
};

export type PaymentPagination = {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
};

export type PaymentListResponse = {
    list: Payment[];
    pagination: PaymentPagination;
};

export const GetPayments = async (
    { page = 1, perPage = constants.PER_PAGE },
    projectUuid: string,
    filters: { startDate?: string; endDate?: string; customerUuid?: string } = {},
): Promise<PaymentListResponse> => {
    const response: any = await GET(apiUrl.payments, {
        projectUuid,
        page,
        perPage,
        ...filters,
    });

    return response?.status && response.data
        ? response.data
        : {
            list: [],
            pagination: { page, perPage, total: 0, totalPages: 0 },
        };
};
