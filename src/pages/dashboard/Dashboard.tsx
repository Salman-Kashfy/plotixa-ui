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
import {DashboardStats} from "../../services/dashboard.service";
import {PickersShortcutsItem} from "@mui/x-date-pickers/PickersShortcuts";
import {DateRange} from "@mui/x-date-pickers-pro/models";
import dayjs, {Dayjs} from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro/DateRangePicker";
import {SingleInputDateRangeField} from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import DashboardStat from './DashboardStat'
import Stacking from './DailyStacking'

function formatCurrency(value: number, currencyCode: string): string {
    if (!value) return `${currencyCode} 0`;
    if (value >= 10_000_000) return `${currencyCode} ${(value / 10_000_000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
    if (value >= 100_000)    return `${currencyCode} ${(value / 100_000).toFixed(2).replace(/\.?0+$/, '')} Lac`;
    return `${currencyCode} ${value.toLocaleString()}`;
}

function Dashboard() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext:any = useContext(AdminContext)
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || ''
    const [daterange, setDaterange] = useState<{start: Dayjs | null, end: Dayjs | null}>({
        start: dayjs().startOf('month'),
        end: dayjs().endOf('month')
    });

    /**
    * Dashboard Stats
    * */
    const [statsLoader, setStatsLoader] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        totalPlots: 0,
        soldPlots: 0,
        remainingPlots: 0,
        totalPlotValue: 0,
    })

    const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
        {
            label: 'This Week',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('week'), today.endOf('week')];
            },
        },
        {
            label: 'Last Week',
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, 'day');
                return [prevWeek.startOf('week'), prevWeek.endOf('week')];
            },
        },
        {
            label: 'Last 7 Days',
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, 'day'), today];
            },
        },
        {
            label: 'Previous Month',
            getValue: () => {
                const today = dayjs();
                const firstDayOfPrevMonth = today.subtract(1, 'month').startOf('month');
                const lastDayOfPrevMonth = today.subtract(1, 'month').endOf('month');
                return [firstDayOfPrevMonth, lastDayOfPrevMonth];
            },
        },
        {
            label: 'Current Month',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('month'), today.endOf('month')];
            },
        },
        {
            label: 'Next Month',
            getValue: () => {
                const today = dayjs();
                const startOfNextMonth = today.endOf('month').add(1, 'day');
                return [startOfNextMonth, startOfNextMonth.endOf('month')];
            },
        },
    ]

    const handleDaterange = ([start, end]: [Dayjs | null, Dayjs | null]) => {
        if (start) {
            if(start && end){
                const cappedEnd = end && end.diff(start, 'day') > 30 ? start.add(31, 'day') : end ?? start.add(30, 'day');
                setDaterange({ start, end: cappedEnd });
            }
        } else {
            setDaterange({ start: null, end: null });
        }
    }

    const dateRangeDD = (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateRangePicker
                slots={{ field: SingleInputDateRangeField }}
                format="MMM DD, YYYY"
                value={[dayjs(daterange.start), dayjs(daterange.end)]}
                label="Select Daterange"
                onChange={handleDaterange}
                slotProps={{
                    textField: {
                        variant: 'outlined',
                        sx: { width: '100%' },
                        size: 'small',
                    },
                    shortcuts: {
                        items: shortcutsItems,
                    },
                }}
            />
        </LocalizationProvider>
    );

    const filters = (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, lg: 'auto' }} sx={{ minWidth: { lg: 250 } }}>
                    {dateRangeDD}
                </Grid>
            </Grid>
        </Box>
    );

    const fetchStats = () => {
        setStatsLoader(true)
        DashboardStats({start: (daterange!.start)?.startOf('day')?.toISOString(), end: (daterange!.end)?.endOf('day').toISOString()}).then((response:any) => {
            if(response?.status){
                setDashboardStats(response.data)
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
    }, []);

    useEffect(() => {
        fetchStats()
    }, [daterange]);

    return (
        <Box sx={{ mt: { xs: 0, sm: 2 } }}>
            <PageTitle title="Dashboard" input={filters} />
            <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 4 } }}>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.totalPlots} title="Total Plots" icon={<GridOnOutlinedIcon sx={{ color: '#fff' }} />} iconBg="primary.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.soldPlots} title="Sold Plots" icon={<SellOutlinedIcon sx={{ color: '#fff' }} />} iconBg="error.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={dashboardStats.remainingPlots} title="Remaining Plots" icon={<LandscapeOutlinedIcon sx={{ color: '#fff' }} />} iconBg="success.main" loading={statsLoader} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                    <DashboardStat value={formatCurrency(dashboardStats.totalPlotValue, currencyCode)} title="Total Plot Value" icon={<AccountBalanceWalletOutlinedIcon sx={{ color: '#fff' }} />} iconBg="warning.main" loading={statsLoader} />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <Stacking payments={[]} loading={false} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard