import {constants} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetCountries = async (params = {}) => {
    const query = `
        query Countries($params: CountryFilter) {
            countries(params: $params) {
                list {
                    id
                    name
                    phoneCode
                }
            }
        }
    `
    const variables = {
        params,
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables});
    return response?.data?.countries?.list.length ? response?.data?.countries?.list : []
}

export const GetCities = async (countryId:string) => {
    const query = `
        query Cities($countryId: ID!) {
            cities(countryId: $countryId) {
                list {
                    id
                    name
                }
            }
        }
    `
    const variables = {
        countryId
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.cities?.list.length ? response?.data?.cities?.list : []
}

export const GetAuthCities = async () => {
    const query = `
        query List {
             authCities {
                list {
                    id
                    name
                }
            }
        }
    `
    const variables = {}
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.authCities?.list.length ? response?.data?.authCities?.list : []
}