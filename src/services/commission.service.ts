import {constants, emptyListResponse} from "../utils/constants";
import {POST} from "./api.service.wrapper";

export const PTCommission = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query PTCommission($params: CommissionFilter) {
            ptCommission(params: $params) {
                list {
                    id
                    orderType
                    type
                    percentage
                    amount
                    currencyCode
                    currencySymbol
                    settlement
                    createdAt
                    instructor {
                        id
                        fullName
                    }
                    customer {
                        id
                        fullName
                    }
                    service {
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
    return response?.data?.ptCommission?.list.length ? response?.data?.ptCommission : emptyListResponse
}