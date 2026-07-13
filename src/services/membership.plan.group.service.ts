import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetMembershipPlanGroups = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query MembershipPlanGroups($params: MembershipPlanGroupFilter, $paging: PaginatorInput) {
            membershipPlanGroups(params: $params, paging: $paging) {
                list {
                    id
                    name
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
    return response?.data?.membershipPlanGroups?.list.length ? response?.data?.membershipPlanGroups : emptyListResponse
}

export const GetMembershipPlanGroup = async (id) => {
    const query = `
        query MembershipPlanGroup($membershipPlanGroupId: ID!) {
            membershipPlanGroup(id: $membershipPlanGroupId) {
                data {
                    id
                    name
                    brandId
                    createdAt
                    updatedAt
                    brand {
                        id
                        name
                    }
                    description
                    createdBy {
                        fullName
                    }
                    lastUpdatedBy {
                        fullName
                    }
                }
                errorMessage
                status
            }
        }
    `
    const variables = {
        membershipPlanGroupId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.membershipPlanGroup.data || {}
}

export const SaveMembershipPlanGroup = async (data) => {
    const query = `
        mutation SaveMembershipPlanGroup($input: SaveMembershipPlanGroupInput!) {
            saveMembershipPlanGroup(input: $input) {
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
    return response?.data?.saveMembershipPlanGroup || emptyMutationResponse
}