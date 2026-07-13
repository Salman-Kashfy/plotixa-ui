import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetBrands = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Brand($paging: PaginatorInput, $params: BrandsFilter) {
            brands(paging: $paging, params: $params) {
                list {
                    id
                    name
                    logo
                    status
                    country {
                        id
                        name
                    }
                    gyms {
                        id
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
    return response?.data?.brands?.list.length ? response?.data?.brands : emptyListResponse
}

export const GetBrand = async (id) => {
    const query = `
        query Brand($brandId: ID!) {
            brand(id: $brandId) {
                data {
                    id
                    name
                    email
                    logo
                    imageUrl
                    legalName
                    phone
                    phoneCode
                    phoneNumber
                    countryId
                    status
                    createdAt
                    updatedAt
                    createdBy {
                        id
                        fullName
                    }
                    lastUpdatedBy {
                        id
                        fullName
                    }
                    country {
                        name
                    }
                    subscription {
                        name
                        type
                        price
                        status
                        gymCount
                        duration
                        billingCycle
                        paymentStatus
                        currencySymbol
                        subscriptionPaymentPlanId
                        expiryDate
                    }
                }
                errors
                status
            }
        }
    `
    const variables = {
        brandId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.brand.data || {}
}

export const CreateBrand = async (data) => {
    const query = `
        mutation CreateBrand($input: CreateBrandInput!) {
            createBrand(input: $input) {
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
    return response?.data?.createBrand || emptyMutationResponse
}

export const UpdateBrand = async (data) => {
    const query = `
        mutation UpdateBrand($input: UpdateBrandInput!) {
            updateBrand(input: $input) {
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
    return response?.data?.updateBrand || emptyMutationResponse
}
