import {apiUrl} from "../utils/constants";
import {POST,GET} from "./api.service.wrapper";

interface DashboardStatsInput {
    gymId: string,
    start: any,
    end: any
}

export const DashboardStats = async (params:DashboardStatsInput) => {
    return GET(apiUrl.dashboardStats, params);
}
