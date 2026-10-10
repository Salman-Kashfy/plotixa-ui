import { apiUrl, constants, emptyMutationResponse } from '../utils/constants';
import { DELETE, GET, POST } from './api.service.wrapper';

export type Customer = {
    uuid: string;
    firstName: string;
    lastName: string;
    phoneCode: string;
    phoneNumber: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CustomerFields = {
    uuid?: string;
    firstName: string;
    lastName: string;
    phoneCode: string;
    phoneNumber: string;
};

export type CustomerUpsertPayload = CustomerFields & {
    projectUuid: string;
};

export type CustomerListResponse = {
    status: boolean;
    data?: {
        list: Customer[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    };
    errorMessage?: string;
    message?: string;
};

export const GetCustomers = async (
    paging: { page?: number; perPage?: number; limit?: number } = {},
    projectUuid: string,
    filters: { phone?: string } = {},
): Promise<CustomerListResponse> => {
    const { page = 1 } = paging;
    const perPage = paging.perPage ?? paging.limit ?? constants.PER_PAGE;
    const params: Record<string, string | number> = { projectUuid, page, perPage };
    if (filters.phone) params.phone = filters.phone;
    const response: CustomerListResponse | undefined = await GET(apiUrl.customers, params);
    return response || {
        status: false,
        errorMessage: 'Unable to load customers. Please try again.',
    };
};

export const GetCustomer = async (uuid: string, projectUuid: string) => {
    const response: { status: boolean; data?: Customer; errorMessage?: string; message?: string } | undefined =
        await GET(`${apiUrl.customers}/${encodeURIComponent(uuid)}`, { projectUuid });
    return response || {
        status: false,
        errorMessage: 'Unable to load customer details. Please try again.',
    };
};

export const UpsertCustomer = async (data: CustomerUpsertPayload) => {
    const response: any = await POST(apiUrl.customers, data);
    return response || emptyMutationResponse;
};

export const DeleteCustomer = async (uuid: string, projectUuid: string) => {
    const response: any = await DELETE(`${apiUrl.customers}/${encodeURIComponent(uuid)}`, { projectUuid });
    return response || emptyMutationResponse;
};
