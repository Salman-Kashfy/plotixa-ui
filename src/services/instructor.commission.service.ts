import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const InstructorCommissions = async (params = {}) => {
    const query = `
        query InstructorCommissions($params: InstructorCommissionFilter!) {
            instructorContractCommission(params: $params) {
                list {
                    id
                    type
                    amount
                    currencyCode
                    currencySymbol
                    percentage
                    service {
                        id
                        name
                    }
                }
            }
        }
    `
    const variables = {
        params
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.instructorContractCommission?.list.length ? response?.data?.instructorContractCommission : emptyListResponse
}

export const SaveContractCommission = async (data) => {
    const query = `
        mutation SaveContractCommission($input: SaveContractCommissionInput!) {
            saveContractCommission(input: $input) {
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
    return response?.data?.saveContractCommission || emptyMutationResponse
}