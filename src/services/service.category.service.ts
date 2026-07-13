import {constants, emptyListResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetServiceCategories = async (params = {}) => {
    const query = `
        query List {
            serviceCategories {
                list {
                    id
                    name
                }
            }
        }
    `
    const variables = {}
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.serviceCategories?.list.length ? response?.data?.serviceCategories : emptyListResponse
}