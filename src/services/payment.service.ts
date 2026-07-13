import {apiUrl, constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

interface BillingTotalInterface {
    scheduleId?: string
    scheduleGroupId?: string
    bookedTime?: string
    paymentPlanId?: string
    orderType: string
    customerId: string
    bookedFor?: Date
    bookedTill?: Date
    sessionContractId?: string
}

export const BillingTotal = async (data:BillingTotalInterface) => {
    const response = await POST(apiUrl.billingTotal, data);
    return response.status ? response.data : {}
}

export const PurchaseContract = async (data) => {
    const query = `
        mutation BuyAPrivateCoachFromAdminPlatform($input: BuyAPrivateCoachFromAdminPlatformInput!) {
            buyAPrivateCoachFromAdminPlatform(input: $input) {
                orderPrivateCoach {
                    id
                }
                status
                error
                paymentUrl
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.buyAPrivateCoachFromAdminPlatform || emptyMutationResponse
}

export const PayContractPendingAmount = async (data) => {
    const query = `
        mutation PayPendingAmountFromAdminPlatform($input: PayPendingAmountFromAdminPlatformInput!) {
            payPendingAmountFromAdminPlatform(input: $input) {
                orderPrivateCoach {
                    id
                }
                status
                error
                paymentUrl
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.payPendingAmountFromAdminPlatform || emptyMutationResponse
}

export const GetPayments = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
    query Payments($paging: PaginatorInput!, $params: PaymentFilters!) {
        payments(paging: $paging, params: $params) {
            list {
                id
                amount
                orderId
                subtotal
                taxRate
                totalTax
                orderType
                invoiceNo
                paymentStatus
                currencySymbol
                isSplitPayment
                pendingAmount
                discountedAmount
                createdAt
                customer {
                    id
                    fullName
                }
                membership {
                    name
                    membershipPlanId
                }
                orderPrivateCoach {
                    name
                    total
                    sessionContract {
                        serviceId
                    }
                }
                orderGymClass {
                    id
                    name
                    scheduleGroupId
                }
                paymentMethod {
                    paymentScheme
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
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.payments?.list.length ? response?.data?.payments : emptyListResponse
}