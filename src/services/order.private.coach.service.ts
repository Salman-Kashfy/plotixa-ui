import {POST} from "./api.service.wrapper";
import {constants, emptyListResponse, emptyMutationResponse} from "../utils/constants";

export const AllBookedPTSessions = async (params) => {
    const query = `
        query AllBookedPTSessions($paging: PaginatorInput, $params: AllBookedPTSessionsParams!) {
            allBookedPTSessions(paging: $paging, params: $params) {
                list {
                    attend
                    id
                    code
                    sessionDate
                    shortCode
                    dayName
                    openTime
                    openTimeLabel
                    openDuration
                    closeTime
                    closeTimeLabel
                    sessionContractId
                    amount
                    customer {
                        id
                        fullName
                        customerCode
                    }
                    brandName
                    gymName
                    instructorName
                    isFree
                    currentEvent
                    serviceName
                    serviceType
                    instructorLongitude
                    instructorLatitude
                    gymStudioId
                    instructorId
                    message
                    customerId
                    openDuration
                    members {
                        id
                        fullName
                        customerCode
                    }
                }
            }
        }
    `
    const variables = {
        params,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.allBookedPTSessions?.list.length ? response?.data?.allBookedPTSessions : emptyListResponse
}

export const BookAPrivateCoach = async (data) => {
    const query = `
        mutation BookAPrivateCoachFromAdminPlatform($input: BookAPrivateCoachFromAdminPlatformInput!) {
            bookAPrivateCoachFromAdminPlatform(input: $input) {
                bookingId
                errorMessage
                error
                orderPrivateCoach {
                  id
                }
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.bookAPrivateCoachFromAdminPlatform || emptyMutationResponse
}

export const UpdateABooking = async (data) => {
    const query = `
        mutation UpdateABookingFromAdminPlatform($input: UpdateABookingFromAdminPlatformInput!) {
            updateABookingFromAdminPlatform(input: $input) {
                bookingId
                errorMessage
                error
                orderPrivateCoach {
                  id
                }
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.updateABookingFromAdminPlatform || emptyMutationResponse
}

export const CancelPTBooking = async (bookingId) => {
    const query = `
        mutation CancelPTBookingFromAdmin($bookingId: ID!) {
            cancelPTBookingFromAdmin(bookingId: $bookingId) {
                status
                errorMessage
                error
            }
        }
    `
    const variables = { bookingId }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.cancelPTBookingFromAdmin || emptyMutationResponse
}