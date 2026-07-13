import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetAdmins = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Admins($paging: PaginatorInput!, $params: AdminsFilter) {
            admins(paging: $paging, params: $params) {
                list {
                    id
                    fullName
                    phone
                    status
                    gender
                    brands {
                        id
                        name
                    }
                    gyms {
                        id
                        name
                    }
                    roles {
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
    return response?.data?.admins?.list.length ? response?.data?.admins : emptyListResponse
}

export const GetAdmin = async (id) => {
    const query = `
        query Admin($adminId: ID!) {
            admin(id: $adminId) {
                data {
                    id
                    firstName
                    lastName
                    fullName
                    gender
                    phone
                    phoneCode
                    phoneNumber
                    roleId
                    status
                    email
                    gymId
                    brandId
                    biometricUserId
                    createdAt
                    updatedAt
                    roles {
                        name
                    }
                    gyms {
                        id
                        name
                    }
                    brands {
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
                errorMessage
                status
            }
        }
    `
    const variables = {
        adminId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.admin.data || {}
}

export const SaveAdmin = async (data) => {
    const query = `
        mutation SaveAdmin($input: SaveAdminInput!) {
            saveAdmin(input: $input) {
                data {
                    id
                }
                errors
                errorMessage
                status
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveAdmin || emptyMutationResponse
}