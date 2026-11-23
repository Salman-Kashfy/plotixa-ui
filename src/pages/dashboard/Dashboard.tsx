import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {AdminContext} from '../../hooks/AdminContext';
import PageTitle from "../../components/PageTitle";
import {Box} from '@mui/material';
import Grid from '@mui/material/Grid2';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import {DashboardStats} from "../../services/dashboard.service";
import DashboardStat from './DashboardStat'

function Dashboard() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext:any = useContext(AdminContext)
    /**
    * Dashboard Stats
    * */
    const [statsLoader, setStatsLoader] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        totalPlots: 0,
        reservedPlots: 0,
        bookedPlots: 0,
        soldPlots: 0,
        overduePayments: 0,
    })

    const fetchStats = () => {
        setStatsLoader(true)
        if (!adminContext.projectUuid) {
            setDashboardStats({
                totalPlots: 0,
                reservedPlots: 0,
                bookedPlots: 0,
                soldPlots: 0,
                overduePayments: 0,
            });
            setStatsLoader(false);
            return;
        }
        DashboardStats(adminContext.projectUuid).then((response:any) => {
            if(response?.status && response.data){
                setDashboardStats({
                    totalPlots: Number(response.data.totalPlots || 0),
                    reservedPlots: Number(response.data.reservedPlots || 0),
                    bookedPlots: Number(response.data.bookedPlots || 0),
                    soldPlots: Number(response.data.soldPlots || 0),
                    overduePayments: Number(response.data.overduePayments || 0),
                })
            }
            setStatsLoader(false)
        }).catch((e) => {
            setStatsLoader(false)
            console.log(e?.message)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([])
        fetchStats()
    }, [adminContext.projectUuid]);

    return (
        <Box sx={{ mt: { xs: 0, sm: 2 } }}>
            <PageTitle title="Dashboard" />
            <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 4 } }}>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.totalPlots} title="Total Plots" icon={<GridOnOutlinedIcon sx={{ color: '#fff' }} />} iconBg="primary.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.reservedPlots} title="Reserved Plots" icon={<LandscapeOutlinedIcon sx={{ color: '#fff' }} />} iconBg="warning.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.bookedPlots} title="Booked Plots" icon={<SellOutlinedIcon sx={{ color: '#fff' }} />} iconBg="success.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.soldPlots} title="Sold Plots" icon={<AccountBalanceWalletOutlinedIcon sx={{ color: '#fff' }} />} iconBg="error.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.overduePayments} title="Overdue Installment" icon={<EventBusyOutlinedIcon sx={{ color: '#fff' }} />} iconBg="error.main" loading={statsLoader} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard