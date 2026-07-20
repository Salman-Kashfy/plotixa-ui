import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

// ─── Expense Types ────────────────────────────────────────────────────────────

export const GetExpenseTypes = async (params = {}) => {
    const response: any = await GET(apiUrl.expenseTypes, params);
    return response?.status ? response.data : [];
};

export const CreateExpenseType = async (data: { name: string }) => {
    const response: any = await POST(apiUrl.expenseTypes, data as any);
    return response || emptyMutationResponse;
};

export const UpdateExpenseType = async (id: string, data: { name: string }) => {
    const response: any = await POST(`${apiUrl.expenseTypes}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeleteExpenseType = async (id: string) => {
    const response: any = await POST(`${apiUrl.expenseTypes}/${id}/delete`);
    return response || emptyMutationResponse;
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const GetExpenses = async ({ page = 1, limit = constants.PER_PAGE }, params = {}) => {
    const response: any = await GET(apiUrl.expenses, { page, limit, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetExpense = async (id: string) => {
    const response: any = await GET(`${apiUrl.expenses}/${id}`);
    return response?.status ? response.data : {};
};

export const CreateExpense = async (data: { expenseTypeId: string; amount: number }) => {
    const response: any = await POST(apiUrl.expenses, data as any);
    return response || emptyMutationResponse;
};

export const UpdateExpense = async (id: string, data: { expenseTypeId: string; amount: number }) => {
    const response: any = await POST(`${apiUrl.expenses}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeleteExpense = async (id: string) => {
    const response: any = await POST(`${apiUrl.expenses}/${id}/delete`);
    return response || emptyMutationResponse;
};
