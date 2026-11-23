import {apiUrl} from "../utils/constants";
import { GET } from "./api.service.wrapper";

export interface DashboardStatsData {
    totalPlots: number;
    reservedPlots: number;
    bookedPlots: number;
    soldPlots: number;
    overduePayments: number;
}

export const DashboardStats = async (projectUuid: string) => {
    return GET(apiUrl.dashboardStats, { projectUuid });
}
