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

export const PurchaseMembership = async (data) => {
    const query = `
        mutation PurchaseMembershipByAdmin($input: PurchaseMembershipInput!) {
            purchaseMembershipByAdmin(input: $input) {
                membership {
                    id
                }
                error
                status
                paymentUrl
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.purchaseMembershipByAdmin || emptyMutationResponse
}

export const PayMembershipPendingAmount = async (data) => {
    const query = `
        mutation PayMembershipPendingAmount($input: PayMembershipPendingAmountInput!) {
            payMembershipPendingAmount(input: $input) {
                membership {
                    id
                }
                error
                status
                paymentUrl
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.payMembershipPendingAmount || emptyMutationResponse
}

export const CustomerMemberships = async ({page = 1, limit = constants.PER_PAGE}, params:{gymId:string,customerId:string}) => {
    const query = `
        query CustomerMemberships($paging: PaginatorInput!, $params: CustomerMembershipFilter) {
            customerMemberships(paging: $paging, params: $params) {
                list {
                    id
                    name
                    startDate
                    endDate
                    total
                    joiningFee
                    price
                    subtotal
                    totalTax
                    taxRate
                    pendingAmount
                    customerId
                    paymentPlanId
                    membershipPlanId
                    status
                    isChampion
                    championType
                    gym {
                        id
                        name
                    }
                    customGyms {
                        id
                        name
                    }
                    paymentPlan {
                        name
                    }
                    membershipPlan {
                        name
                    }
                    createdBy {
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
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.customerMemberships?.list.length ? response?.data?.customerMemberships : emptyListResponse
}

export const GetMemberships = async ({page = 1, limit = constants.PER_PAGE}, params:{gymId:string}) => {
    const query = `
        query Memberships($paging: PaginatorInput!, $params: MembershipFilter) {
            memberships(paging: $paging, params: $params) {
                list {
                    id
                    name
                    startDate
                    endDate
                    total
                    joiningFee
                    price
                    subtotal
                    totalTax
                    taxRate
                    pendingAmount
                    customerId
                    paymentPlanId
                    membershipPlanId
                    status
                    isChampion
                    championType
                    gym {
                        id
                        name
                    }
                    leadCustomerDuplicate {
                        customerId
                        duplicateCustomerId
                        duplicateCustomer {
                            id
                            fullName
                            customerCode
                        }
                    }
                    customer {
                        id
                        fullName
                        customerCode
                        country {
                            taxName
                            currency {
                                symbol
                            }
                        }
                    }
                    customGyms {
                        id
                        name
                    }
                    paymentPlan {
                        name
                    }
                    membershipPlan {
                        name
                    }
                    createdBy {
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
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.memberships?.list.length ? response?.data?.memberships : emptyListResponse
}

export const CancelMembership = async (data) => {
    const query = `
        mutation CancelMembershipByAdmin($input: CancelMembershipInput!) {
            cancelMembershipByAdmin(input: $input) {
                status
                error
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.cancelMembershipByAdmin || emptyMutationResponse
}

export const RenewMembership = async (data) => {
    const query = `
        mutation RenewMembershipByAdmin($input: RenewMembershipInput!) {
            renewMembershipByAdmin(input: $input) {
                membership {
                    id
                }
                status
                error
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.renewMembershipByAdmin || emptyMutationResponse
}