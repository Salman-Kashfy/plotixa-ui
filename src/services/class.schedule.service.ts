import {constants, emptyListResponse, emptyMutationResponse} from '../utils/constants';
import {POST} from './api.service.wrapper';

export const GetGymClassSchedules = async ({page = 1, limit = constants.PER_PAGE}, params = {}) => {
    const query = `
        query GymClassGroupSchedules($params: GymClassGroupScheduleFilter!) {
            gymClassGroupSchedules(params: $params) {
                list {
                    id
                    startDate
                    endDate
                    duration
                    status
                    orderCount
                    gender
                    spots
                    schedule {
                        day
                    }
                    gymClass {
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
    return response?.data?.gymClassGroupSchedules?.list.length ? response?.data?.gymClassGroupSchedules : emptyListResponse
}

export const GetGymClassSchedule = async (id) => {
    const query = `
        query GymClassGroupSchedule($gymClassGroupScheduleId: ID!) {
            gymClassGroupSchedule(id: $gymClassGroupScheduleId) {
                data {
                    id
                    startDate
                    endDate
                    duration
                    spots
                    gymId
                    gender
                    gymClassId
                    dropInClient
                    dropInClientPrice
                    gymMemberClient
                    gymMemberClientPrice
                    status
                    orderCount
                    gym {
                        id
                        name
                        brand {
                            country {
                                currency {
                                    symbol
                                }
                            }
                        }
                    }
                    gymClass {
                        id
                        name
                    }
                    schedule {
                        day
                        spots
                        openTime
                        duration
                        gender
                        instructorIds
                        instructors {
                            id
                            fullName
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
                errorMessage
                status
            }
        }
    `
    const variables = {
        gymClassGroupScheduleId: id
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.gymClassGroupSchedule.data || {}
}

export const SaveGymClassGroupSchedule = async (data) => {
    const query = `
        mutation SaveGymClassScheduleGroup($input: GymClassScheduleGroupInput!) {
            saveGymClassScheduleGroup(input: $input) {
                data {
                    id
                }
                status
                errorMessage
            }
        }
    `
    const variables = {
        input: data
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.saveGymClassScheduleGroup || emptyMutationResponse
}

export const GymClassesListing = async (params) => {
    const query = `
        query GymClassesListing($params: GymClassesListingFilter) {
            gymClassesListing(params: $params) {
                list {
                    id
                    name
                    endDate
                    date
                    status
                    openTime
                    closeTime
                    spotsCapacity
                    spotsAllotted
                    soldOut
                    scheduleId
                    scheduleGroupId
                    instructors {
                        id
                        fullName
                    }
                }
            }
        }
    `
    const variables = {
        params
    }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.gymClassesListing?.list.length ? response?.data?.gymClassesListing : emptyListResponse
}