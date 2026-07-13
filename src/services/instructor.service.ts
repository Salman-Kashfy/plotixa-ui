import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetInstructors = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query Instructors($paging: PaginatorInput, $params: InstructorsFilter) {
            instructors(paging: $paging, params: $params) {
                list {
                    id
                    fullName
                    phone
                    status
                    gender
                    gym {
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
    return response?.data?.instructors?.list.length ? response?.data?.instructors : emptyListResponse
}

export const SaveInstructors = async (data) => {
    const query = `
        mutation SaveInstructor($input: SaveInstructorInput!) {
            saveInstructor(input: $input) {
                data {
                    id
                }
                errors
                errorMessage
                status
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveInstructor || emptyMutationResponse
}

export const GetInstructor = async (id) => {
    const query = `
        query Instructor($instructorId: ID!) {
            instructor(id: $instructorId) {
                data {
                    id
                    firstName
                    lastName
                    fullName
                    gender
                    dob
                    photo
                    phone
                    phoneCode
                    phoneNumber
                    gymId
                    status
                    email
                    description
                    countryId
                    createdAt
                    updatedAt
                    country {
                        name
                    }
                    gym {
                        id
                        name
                        brandId
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
        instructorId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.instructor.data || {}
}