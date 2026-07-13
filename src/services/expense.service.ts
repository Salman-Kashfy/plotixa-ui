import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetExpenses = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Expense($params: ExpenseFilter, $paging: PaginatorInput) {
            expenses(params: $params, paging: $paging) {
                list {
                    id
                    amount
                    gymId
                    currencySymbol
                    date
                    categoryId
                    status
                    expenseCategory {
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
    return response?.data?.expenses?.list.length ? response?.data?.expenses : emptyListResponse
}

export const GetExpenseCategories = async () => {
    const query = `
        query ExpenseCategories {
            expenseCategories {
                list {
                    id
                    name
                    parentId
                }
            }
        }
    `
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim() });
    return response?.data?.expenseCategories?.list.length ? response?.data?.expenseCategories : emptyListResponse
}

export const CreateExpense = async (data) => {
    const query = `
        mutation CreateExpense($input: CreateExpenseInput!) {
            createExpense(input: $input) {
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
    return response?.data?.createExpense || emptyMutationResponse
}

export const UpdateExpense = async (data) => {
    const query = `
        mutation UpdateExpense($input: UpdateExpenseInput!) {
            updateExpense(input: $input) {
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
    return response?.data?.updateExpense || emptyMutationResponse
}