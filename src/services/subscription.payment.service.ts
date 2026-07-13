import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetSubscriptionPayments = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query GetSubscriptionPayments($paging: PaginatorInput!, $params: SubscriptionPaymentFilter) {
            subscriptionPayments(paging: $paging, params: $params) {
                list {
                    id
                    amount
                    currencySymbol
                    transactionId
                    paymentStatus
                    paymentScheme
                    createdAt
                    brand {
                        id
                        name
                    }
                    subscriptionPaymentPlan {
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
    return response?.data?.subscriptionPayments?.list.length ? response?.data?.subscriptionPayments : emptyListResponse
}

export const UpdatePaymentStatus = async (input) => {
    const query = `
        mutation UpdatePaymentStatus($input: UpdateSubscriptionPaymentInput!) {
            updatePaymentStatus(input: $input) {
                data {
                    id
                }
                status
                errorMessage
            }
        }
    `
    const variables = {
        input,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.updatePaymentStatus || emptyMutationResponse
}