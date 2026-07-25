import { apiUrl, constants, emptyListResponse, emptyMutationResponse } from '../utils/constants';
import { GET, POST } from './api.service.wrapper';

export const GetBookings = async ({ page = 1, limit = constants.PER_PAGE }, params = {}) => {
    const response: any = await GET(apiUrl.bookings, { page, limit, ...params });
    return response?.status ? response : emptyListResponse;
};

export const GetBooking = async (id: string) => {
    const response: any = await GET(`${apiUrl.bookings}/${id}`);
    return response?.status ? response.data : {};
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
