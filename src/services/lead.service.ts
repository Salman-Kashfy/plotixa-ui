import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetLeads = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Leads($params: LeadsFilter!, $paging: PaginatorInput) {
            leads(params: $params, paging: $paging) {
                list {
                    id
                    fullName
                    leadStatus
                    phone
                    phoneNumber
                    leadType
                    source
                    gender
                    email
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
    return response?.data?.leads?.list.length ? response?.data?.leads : emptyListResponse
}

export const GetLead = async (id) => {
    const query = `
        query Lead($leadId: ID!) {
            lead(id: $leadId) {
                data {
                    id
                    fullName
                    firstName
                    lastName
                    gender
                    gymId
                    email
                    dob
                    address
                    leadStatus
                    leadType
                    phone
                    phoneCode
                    phoneNumber
                    source
                    status
                    customerId
                    countryId
                    isParent
                    createdAt
                    updatedAt
                    gym {
                        id
                        name
                    }
                    country {
                        id
                        name
                    }
                    linkedAccounts {
                        id
                        fullName
                        firstName
                        lastName
                        gender
                        dob
                        phoneCode
                        phoneNumber
                    }
                    parentLead {
                        id
                        fullName
                        phone
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
        leadId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.lead.data || {}
}

export const CreateLead = async (data) => {
    const query = `
        mutation CreateLead($input: SaveLeadInput!) {
            addLead(input: $input) {
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
    return response?.data?.addLead || emptyMutationResponse
}

export const UpdateLead = async (data) => {
    const query = `
        mutation UpdateLead($input: UpdateLeadInput!) {
            updateLead(input: $input) {
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
    return response?.data?.updateLead || emptyMutationResponse
}

export const ConvertLeadToCustomer = async (data) => {
    const query = `
        mutation ConvertLeadToCustomer($input: LeadConversionInput!) {
            convertLeadToCustomer(input: $input) {
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
    return response?.data?.convertLeadToCustomer || emptyMutationResponse
}