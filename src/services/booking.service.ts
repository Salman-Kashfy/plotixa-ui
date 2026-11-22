import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export type InstallmentPlanRequest = {
    projectUuid: string;
    categoryUuid: string;
    plotUuid: string;
    tokenAmount: number;
    bookingAmount: number;
    allocationAmount: number;
    confirmationAmount: number;
    startOfWorkAmount: number;
    onPossessionAmount: number;
    quarterlyAmount: number;
    tenure: number;
};

export type InstallmentPlanItem = {
    month: string;
    dueDate: string;
    displayLabel: string;
    type: 'monthly' | 'monthly+quaterly';
    amount: number;
};

export const PreviewInstallmentPlan = async (data: InstallmentPlanRequest) => {
    const response: any = await POST(`${apiUrl.bookings}/installment-plan`, data);
    return response || emptyMutationResponse;
};

export type BookingListItem = {
    uuid: string;
    dueDayOfMonth: number;
    plotPrice: string;
    tokenAmount: string;
    bookingAmount: string;
    allocationAmount: string;
    confirmationAmount: string;
    startOfWorkAmount: string;
    onPossessionAmount: string;
    quarterlyAmount: string;
    totalUpfront: string;
    remainingAmount: string;
    tenureMonths: number;
    monthlyInstallment: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
    plot: { uuid: string; plotNo: number };
    customer: { uuid: string; firstName: string; lastName: string };
};

export type BookingListResponse = {
    status: boolean;
    data: {
        list: BookingListItem[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    };
};

export const GetBookings = async (
    { page = 1, perPage = constants.PER_PAGE },
    params: { projectUuid: string; customerUuid?: string },
): Promise<BookingListResponse> => {
    const response: any = await GET(apiUrl.bookings, { page, perPage, ...params });
    if (response?.status && response.data) return response;
    return {
        status: false,
        data: {
            list: [],
            pagination: { page, perPage, total: 0, totalPages: 0 },
        },
    };
};

export const GetBooking = async (id: string, projectUuid?: string) => {
    const response: any = await GET(
        `${apiUrl.bookings}/${encodeURIComponent(id)}`,
        projectUuid ? { projectUuid } : {},
    );
    return response?.status ? response.data : {};
};

export type Installment = {
    installmentNumber: number;
    amount: string;
    dueDate: string;
    paidDate: string | null;
    status: 'pending' | 'paid' | 'overdue';
};

export const GetInstallments = async (projectUuid: string, bookingUuid: string) => {
    const response: any = await GET(apiUrl.installments, { projectUuid, bookingUuid });
    return {
        status: Boolean(response?.status),
        data: Array.isArray(response?.data) ? response.data as Installment[] : [],
        message: response?.message,
    };
};

export const CreateBooking = async (data: any) => {
    const response: any = await POST(apiUrl.bookings, data as any);
    return response || emptyMutationResponse;
};

export const UpdateBooking = async (id: string, data: any) => {
    const response: any = await POST(`${apiUrl.bookings}/${id}`, data as any);
    return response || emptyMutationResponse;
};

export const DeleteBooking = async (id: string) => {
    const response: any = await POST(`${apiUrl.bookings}/${id}/delete`);
    return response || emptyMutationResponse;
};
