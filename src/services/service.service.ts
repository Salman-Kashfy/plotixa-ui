import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetServices = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Services($params: ServiceFilter) {
            services(params: $params) {
                list {
                    id
                    name
                    isBookable
                    serviceType
                    servicePack
                    commissionable
                    totalCost
                    brand {
                        country {
                            currency {
                                symbol
                            }
                        }
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
    return response?.data?.services?.list.length ? response?.data?.services : emptyListResponse
}

export const GetService = async (id) => {
    const query = `
        query Service($serviceId: ID!) {
            service(id: $serviceId) {
                data {
                    id
                    name
                    brandId
                    status
                    isBookable
                    commissionable
                    onlineLink
                    serviceType
                    servicePack
                    description
                    totalCost
                    groupNumber
                    totalSessions
                    totalCost
                    packageFeatures
                    sessionDuration
                    serviceValidity
                    sessionSiteType
                    serviceCategoryId
                    serviceCategoryIds
                    createdAt
                    updatedAt
                    serviceCategory {
                        name
                    }
                    brand {
                        id
                        name
                        country {
                            currency {
                                symbol
                            }
                        }
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
        serviceId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.service.data || {}
}

export const SaveService = async (data) => {
    const query = `
        mutation SaveService($input: SaveServiceInput!) {
            saveService(input: $input) {
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
    return response?.data?.saveService || emptyMutationResponse
}