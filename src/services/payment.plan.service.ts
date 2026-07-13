import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetPaymentPlans = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query PaymentPlans($params: PaymentPlanFilter!, $paging: PaginatorInput) {
            paymentPlans(params: $params, paging: $paging) {
                list {
                    id
                    name
                    price
                    membershipPlan {
                        name
                        group {
                            name
                            brand {
                                id
                                name
                                country {
                                    currency {
                                        name
                                        symbol
                                    }
                                }
                            }
                        }
                    }
                    servicePacks {
                        serviceId
                        service {
                            id
                            name
                            commissionable
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
    return response?.data?.paymentPlans?.list.length ? response?.data?.paymentPlans : emptyListResponse
}

export const GetPaymentPlan = async (id) => {
    const query = `
        query PaymentPlan($paymentPlanId: ID!) {
            paymentPlan(id: $paymentPlanId) {
                data {
                    id
                    name
                    type
                    price
                    hasEndDate
                    recursionPeriod
                    recursionDuration
                    allowFreeze
                    joiningFee
                    chargeOnFirst
                    membershipPlanId
                    createdAt
                    updatedAt
                    membershipPlan {
                        id
                        name
                        group {
                            brand {
                                id
                                name
                                country {
                                    currency {
                                        name
                                        symbol
                                    }
                                }
                            }
                        }
                    }
                    servicePacks {
                        serviceId
                        service {
                            id
                            name
                            commissionable
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
        paymentPlanId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.paymentPlan.data || {}
}

export const SavePaymentPlan = async (data) => {
    const query = `
        mutation SavePaymentPlan($input: SavePaymentPlanInput!) {
            savePaymentPlan(input: $input) {
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
    return response?.data?.savePaymentPlan || emptyMutationResponse
}