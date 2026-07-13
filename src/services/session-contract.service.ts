import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetSessionContracts = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query SessionContracts($params: SessionContractFilter, $paging: PaginatorInput) {
            sessionContracts(params: $params, paging: $paging) {
                list {
                    id
                    startDate
                    endDate
                    remainingSessions
                    totalSessions
                    pendingAmount
                    sessionDuration
                    instructorId
                    isPaid
                    isServicePack
                    status
                    service {
                        id
                        name
                        serviceType
                        brand {
                            id
                            name
                            country {
                                currency {
                                    symbol
                                }
                            }
                        }
                    }
                    instructor {
                        id
                        fullName
                    }
                    members {
                        id
                        fullName
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
    return response?.data?.sessionContracts?.list.length ? response?.data?.sessionContracts : emptyListResponse
}

export const GetSessionContract = async (id) => {
    const query = `
        query SessionContract($sessionContractId: ID!) {
            sessionContract(id: $sessionContractId) {
                data {
                    id
                    startDate
                    customerId
                    serviceId
                    instructorId
                    note
                    isServicePack
                    memberIds
                    createdAt
                    updatedAt
                    service {
                        id
                        name
                        serviceType
                        brand {
                            id
                            name
                            country {
                                currency {
                                    symbol
                                }
                            }
                        }
                    }
                    members {
                        id
                        fullName
                        customerCode
                    }
                    instructor {
                        id
                        fullName
                    }
                    customer {
                        gym {
                            id
                            name
                        }
                        fullName
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
        sessionContractId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.sessionContract.data || {}
}

export const SaveSessionContract = async (data) => {
    const query = `
        mutation SaveSessionContract($input: SaveSessionContractInput!) {
            saveSessionContract(input: $input) {
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
    return response?.data?.saveSessionContract || emptyMutationResponse
}