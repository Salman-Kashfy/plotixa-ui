import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetMembershipPlans = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query MembershipPlans($paging: PaginatorInput, $params: MembershipPlanFilter!) {
            membershipPlans(paging: $paging, params: $params) {
                list {
                    id
                    name
                    status
                    isChampion
                    championType
                    group {
                        name
                    }   
                    paymentPlan {
                        name
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
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.membershipPlans?.list.length ? response?.data?.membershipPlans : emptyListResponse
}

export const GetMembershipPlan = async (id) => {
    const query = `
        query MembershipPlan($membershipPlanId: ID!) {
            membershipPlan(id: $membershipPlanId) {
                data {
                    id
                    name
                    groupId
                    description
                    visible
                    isChampion
                    championType
                    customGymIds
                    gracePeriodCancellation
                    createdAt
                    updatedAt
                    group {
                        id
                        name
                        brand {
                            id
                            name
                        }
                    }
                    customGyms {
                        id
                        name
                    }
                    createdBy {
                        fullName
                    }
                    lastUpdatedBy {
                        fullName
                    }
                }
                errors
                status
            }
        }
    `
    const variables = {
        membershipPlanId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.membershipPlan.data || {}
}

export const SaveMembershipPlan = async (data) => {
    const query = `
        mutation SaveMembershipPlan($input: SaveMembershipPlanInput!) {
            saveMembershipPlan(input: $input) {
                data {
                    id
                }
                status
                errors
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveMembershipPlan || emptyMutationResponse
}