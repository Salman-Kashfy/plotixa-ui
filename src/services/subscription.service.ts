import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetSubscriptionPlans = async (params = {}) => {
    const query = `
        query SubscriptionPlans($params: SubscriptionPlanFilter!) {
            subscriptionPlans(params: $params) {
                list {
                    id
                    name
                    type
                    subscriptionPaymentPlans {
                        id
                        name
                        price
                        gymCount
                        duration
                        billingCycle
                        description
                        country {
                            currency {
                                name
                                symbol
                            }
                        }
                    }
                }
            }
        }
    `
    const variables = {
        params,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.subscriptionPlans?.list.length ? response?.data?.subscriptionPlans : emptyListResponse
}

export const SubscriptionPaymentSchemes = async (brandId) => {
    const query = `
        query SubscriptionPaymentSchemes($brandId: String!) {
            subscriptionPaymentSchemes(brandId: $brandId) {
                schemes
            }
        }
    `
    const variables = {
        brandId,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.subscriptionPaymentSchemes?.schemes.length ? response?.data?.subscriptionPaymentSchemes.schemes : []
}

export const PurchaseSubscription = async (input) => {
    const query = `
        mutation PurchaseSubscription($input: PurchaseSubscriptionInput!) {
            purchaseSubscription(input: $input) {
                error
                status
                errorMessage
            }
        }
    `
    const variables = {
        input,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.purchaseSubscription || emptyMutationResponse
}

export const SaveGymStatuses = async (input) => {
    const query = `
        mutation SaveGymStatuses($input: GymStatusesInput!) {
            saveGymStatuses(input: $input) {
                errors
                status
                errorMessage
            }
        }
    `
    const variables = {
        input,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.saveGymStatuses || emptyMutationResponse
}