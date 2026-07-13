import {constants, emptyListResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetRoles = async () => {
    const query = `
        query Roles {
            roles {
                list {
                    id
                    name
                }
            }
        }
    `
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables:{}});
    return response?.data?.roles?.list.length ? response?.data?.roles : emptyListResponse
}