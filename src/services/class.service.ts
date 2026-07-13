import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetGymClasses = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query GymClasses($paging: PaginatorInput, $params: GymClassesFilter) {
            gymClasses(paging: $paging, params: $params) {
                list {
                    id
                    name
                    status
                    classType
                    gymClassCategory {
                        id
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
    return response?.data?.gymClasses?.list.length ? response?.data?.gymClasses : emptyListResponse
}

export const GetGymClass = async (id) => {
    const query = `
        query GymClass($gymClassId: ID!) {
            gymClass(id: $gymClassId) {
                data {
                    id
                    name
                    brandId
                    classType
                    onlineLink
                    description
                    gymClassCategoryId
                    status
                    createdAt
                    updatedAt
                    brand {
                        id
                        name
                    }
                    gymClassCategory {
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
        gymClassId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.gymClass.data || {}
}

export const GetGymClassCategories = async () => {
    const query = `
        query GymClassCategories {
            gymClassCategories {
                list {
                    id
                    name
                }
            }
        }
    `
    const variables = {}
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.gymClassCategories?.list.length ? response?.data?.gymClassCategories : emptyListResponse
}

export const SaveGymClasses = async (data) => {
    const query = `
        mutation SaveGymClass($input: SaveGymClassInput!) {
            saveGymClass(input: $input) {
                data {
                    id
                }
                status
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveGymClass || emptyMutationResponse
}