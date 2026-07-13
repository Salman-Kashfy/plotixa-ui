import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GymQrSessions = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query GymQrSessions($paging: PaginatorInput, $params: GymQrSessionFilter) {
            gymQrSessions(paging: $paging, params: $params) {
                list {
                    id
                    type
                    state
                    gymId
                    bioDate
                    checkIn
                    checkOut
                    overtimeIn
                    overtimeOut
                    adminId
                    customerId
                    admin {
                        id
                        fullName
                    }
                    customer {
                        id
                        fullName
                        imageUrl
                        customerCode
                        membershipStatus
                    }
                }
                paging {
                    totalPages
                    totalResultCount
                }
            }
        }
    `
    const variables = {
        params,
        paging: { page, limit }
    }
    const response: any = await POST(constants.GRAPHQL_SERVER, {query: query.trim(), variables});
    return response?.data?.gymQrSessions?.list.length ? response?.data?.gymQrSessions : emptyListResponse
}

export const SaveGymQrSession = async (data) => {
    const query = `
        mutation SaveGymQrSession($input: SaveGymQrSessionInput!)  {
            saveGymQrSession(input: $input) {
                status
                error
                saved
                exists
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveGymQrSession || emptyMutationResponse
}
