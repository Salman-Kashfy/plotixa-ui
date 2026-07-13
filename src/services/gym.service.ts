import {apiUrl, constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';
import {_GET} from './rest.service.wrapper';

export const GetGyms = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Gyms($paging: PaginatorInput!, $params: GymsFilter) {
            gyms(paging: $paging, params: $params) {
                list {
                    id
                    name
                    status
                    brand {
                        name
                        country {
                            name
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
    return response?.data?.gyms?.list.length ? response?.data?.gyms : emptyListResponse
}

export const GetGym = async (id) => {
    const query = `
        query Gym($gymId: ID) {
            gym(id: $gymId) {
                data {
                    id
                    name
                    email
                    logo
                    imageUrl
                    description
                    prefix
                    phone
                    phoneCode
                    phoneNumber
                    brandId
                    taxMode
                    status
                    shortAddress
                    street
                    building
                    floorNo
                    unitNumber
                    zipCode
                    cityId
                    deviceIp
                    gsReminder
                    gsApiKey
                    gsSourceNo
                    gsSourceName
                    gsTemplate
                    createdAt
                    updatedAt
                    city {
                        name
                    }
                    brand {
                        id
                        name
                        country {
                            id
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
        gymId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.gym.data || {}
}

export const CreateGym = async (data) => {
    const query = `
        mutation CreateGym($input: CreateGymInput!) {
            createGym(input: $input) {
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
    return response?.data?.createGym || emptyMutationResponse
}

export const UpdateGym = async (data) => {
    const query = `
        mutation UpdateGym($input: UpdateGymInput!) {
            updateGym(input: $input) {
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
    return response?.data?.updateGym || emptyMutationResponse
}

export const SaveGymOptions = async (data) => {
    const query = `
        mutation SaveGymOptions($input: GymOptionsInput!) {
            saveGymOptions(input: $input) {
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
    return response?.data?.saveGymOptions || emptyMutationResponse
}

export const isGymPrefixUnique = async (params) => {
    return _GET(constants.API_URL+apiUrl.isGymPrefixUnique, params);
}