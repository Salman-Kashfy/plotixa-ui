import {POST} from "./api.service.wrapper";
import {constants, emptyListResponse, emptyMutationResponse} from "../utils/constants";

export const AllBookedPTClassSessions = async ({page = 1, limit = constants.PER_PAGE},params) => {
    const query = `
        query AllBookedPTClassSessions($params: AllBookedPTClassSessions!, $paging: PaginatorInput) {
            allBookedPTClassSessions(params: $params, paging: $paging) {
                list {
                    id
                    name
                    isAttended
                    isPurchased
                    customer {
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
        paging: { page, limit }
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.allBookedPTClassSessions?.list.length ? response?.data?.allBookedPTClassSessions : emptyListResponse
}

export const BuyAGymClass = async (data) => {
    const query = `
        mutation BuyAGymClassFromAdminPlatform($input: BuyAGymClassFromAdminPlatformInput!) {
            buyAGymClassFromAdminPlatform(input: $input) {
                orderGymClass {
                    id
                }
                status
                paymentUrl
                error
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.buyAGymClassFromAdminPlatform || emptyMutationResponse
}

export const ModifyGymClassSchedule = async (data) => {
    const query = `
        mutation ModifyGymClassSchedule($input: GymClassScheduleItemInput!) {
            modifyGymClassSchedule(input: $input) {
                success
                error
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.modifyGymClassSchedule || emptyMutationResponse
}

export const AttendBookedGymClass = async (data) => {
    const query = `
        mutation AttendBookedGymClass($input: AttendBookedGymClassInput!) {
            attendBookedGymClass(input: $input) {
                success
                error
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.attendBookedGymClass || emptyMutationResponse
}