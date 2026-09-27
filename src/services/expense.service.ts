import { apiUrl, constants, emptyMutationResponse } from '../utils/constants';
import { GET, POST, DELETE } from './api.service.wrapper';

// ─── Expense Types ────────────────────────────────────────────────────────────

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

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const GetExpenses = async ({ page = 1, limit = constants.PER_PAGE }, params: { projectUuid: string; [key: string]: any }) => {
    const response: any = await GET(apiUrl.expenses, { page, limit, ...params });
    return response?.status ? response.data : { list: [], pagination: { page: 1, perPage: limit, total: 0, totalPages: 0 } };
};

export const GetExpense = async (id: string) => {
    const response: any = await GET(`${apiUrl.expenses}/${id}`);
    return response?.status ? response.data : {};
};

export const UpsertExpense = async (data: { expenseTypeUuid: string; projectUuid: string; amount: number; uuid?: string }) => {
    const response: any = await POST(apiUrl.expenses, data as any);
    return response || emptyMutationResponse;
};

export const DeleteExpense = async (id: string) => {
    const response: any = await POST(`${apiUrl.expenses}/${id}/delete`);
    return response || emptyMutationResponse;
};
