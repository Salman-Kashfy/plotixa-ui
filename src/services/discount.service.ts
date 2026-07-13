import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetDiscounts = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Discounts($paging: PaginatorInput!, $params: DiscountsFilter) {
            discounts(paging: $paging, params: $params) {
                list {
                    id
                    name
                    startDate
                    endDate
                    discountOn
                    discountType
                    percentage
                    fixedAmount
                    maxLimit
                    status
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
    return response?.data?.discounts?.list.length ? response?.data?.discounts : emptyListResponse
}

export const GetDiscount = async (id) => {
    const query = `
        query Discount($discountId: ID!) {
            discount(id: $discountId) {
                data {
                    id
                    name
                    discountOn
                    discountType
                    brandId
                    startDate
                    endDate
                    percentage
                    fixedAmount
                    forMembers
                    forNonMembers
                    maxLimit
                    status
                    brand {
                        id
                        name
                        country {
                            currency {
                                symbol
                            }
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
        discountId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.discount.data || {}
}

export const SaveDiscount = async (data) => {
    const query = `
        mutation SaveDiscount($input: SaveDiscountInput!) {
            saveDiscount(input: $input) {
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
    return response?.data?.saveDiscount || emptyMutationResponse
}