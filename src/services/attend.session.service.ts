import {POST} from "./api.service.wrapper";
import {constants, emptyMutationResponse} from "../utils/constants";

export const AttendPTSession = async (bookingId) => {
    const query = `
        mutation AttendPTSessionFromAdmin($bookingId: ID!) {
            attendPTSessionFromAdmin(bookingId: $bookingId) {
                status
                errorMessage
                error
            }
        }
    `
    const variables = { bookingId }
    const response:any = await POST(constants.GRAPHQL_SERVER, { query:query.trim(), variables });
    return response?.data?.attendPTSessionFromAdmin || emptyMutationResponse
}