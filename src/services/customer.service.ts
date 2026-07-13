import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetCustomers = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Customers($params: CustomersFilter!, $paging: PaginatorInput) {
            customers(params: $params, paging: $paging) {
                list {
                    id
                    fullName
                    gender
                    phone
                    phoneNumber
                    customerCode
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
    return response?.data?.customers?.list.length ? response?.data?.customers : emptyListResponse
}

export const GetCustomer = async (id) => {
    const query = `
        query Customer($customerId: ID!) {
            customer(id: $customerId) {
                data {
                    id
                    fullName
                    firstName
                    lastName
                    gender
                    gymId
                    countryId
                    phone
                    phoneCode
                    phoneNumber
                    customerCode
                    email
                    dob
                    photo
                    imageUrl
                    address
                    isParent
                    biometricUserId
                    biometricUid
                    gym {
                        id
                        name
                        brandId
                        deviceIp
                    }
                    country {
                        id
                        name
                        taxName
                        currency {
                            symbol
                            name
                        }
                    }
                    linkedCustomers {
                        id
                        fullName
                        firstName
                        lastName
                        gender
                        dob
                        phoneCode
                        phoneNumber
                    }
                }
                errors
                status
            }
        }
    `
    const variables = {
        customerId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.customer.data || {}
}

export const UpdateCustomer = async (data) => {
    const query = `
        mutation UpdateCustomer($input: UpdateCustomerInput!) {
            updateCustomer(input: $input) {
                data {
                    id
                    fullName
                    firstName
                    lastName
                    gender
                    gymId
                    countryId
                    phone
                    phoneCode
                    phoneNumber
                    customerCode
                    email
                    dob
                    address
                    isParent
                    gym {
                        id
                        name
                        brandId
                    }
                    country {
                        id
                        name
                    }
                    linkedCustomers {
                        id
                        fullName
                        firstName
                        lastName
                        gender
                        dob
                        phoneCode
                        phoneNumber
                    }
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
    return response?.data?.updateCustomer || emptyMutationResponse
}