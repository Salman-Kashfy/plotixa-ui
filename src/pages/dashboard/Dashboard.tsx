import {Fragment, useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import PageTitle from "../../components/PageTitle";
import {Alert, Box} from '@mui/material';
import Grid from '@mui/material/Grid2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import {GLOBAL_STATUSES, ROLE, ROUTES} from "../../utils/constants";
import {getAuthGym} from "../../utils/permissions";
import {AdminContext} from "../../hooks/AdminContext";
import {GetGyms} from "../../services/gym.service";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import FormInput from "../../components/FormInput";
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
import PieChartGeneral from './PieChartGeneral'
import {GetPayments} from "../../services/payment.service";
import {NavLink} from "react-router-dom";
import Link from "@mui/material/Link";
import {GetExpenses} from "../../services/expense.service";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import {PTCommission} from "../../services/commission.service";

function Dashboard() {
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [noGyms, setNoGyms] = useState('');
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [daterange, setDaterange] = useState<{start: Dayjs | null, end: Dayjs | null}>({
        start: dayjs().startOf('month'),
        end: dayjs().endOf('month')
    });

    /**
    * Dashboard Stats
    * */
    const [statsLoader, setStatsLoader] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        activeMemberships: 0,
        totalRevenue: 0,
        totalExpense: 0,
        totalPTCommission: 0
    })

    /**
     * Payments
     * */
    const [payments, setPayments] = useState([]);
    const [paymentsLoader, setPaymentsLoader] = useState(true);

    /**
     * Expenses
     * */
    const [expenses, setExpenses] = useState([]);
    const [expenseLoader, setExpenseLoader] = useState(true);

    /**
     * PT Commissions
     * */
    const [ptCommissions, setPTCommissions] = useState([]);
    const [ptCommLoader, setPTCommLoader] = useState(true);

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

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultGymId(value)
    }

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

    const gymDD = (
        <Autocomplete
            id="gyms-dd"
            options={gyms}
            getOptionLabel={(option) => option.label || ''}
            onChange={handleGymChange}
            value={defaultGymId}
            disableClearable
            renderInput={(params) => (
                <FormInput
                    variant="outlined"
                    sx={{ width: '100%' }}
                    disabled={!gyms.length}
                    label="Gym"
                    params={params}
                    size="small"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            size: 'small',
                            endAdornment: (
                                <Fragment>
                                    {gymLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </Fragment>
                            ),
                        },
                    }}
                />
            )}
        />
    );

    const filters = (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
                {gymSelection ? (
                    <Grid size={{ xs: 12, sm: 6, lg: 'auto' }} sx={{ minWidth: { lg: 220 } }}>
                        {gymDD}
                    </Grid>
                ) : null}
                <Grid size={{ xs: 12, sm: 6, lg: 'auto' }} sx={{ minWidth: { lg: 250 } }}>
                    {dateRangeDD}
                </Grid>
            </Grid>
        </Box>
    );

    const fetchStats = () => {
        setStatsLoader(true)
        DashboardStats({gymId: defaultGymId!.value, start: (daterange!.start)?.startOf('day')?.toISOString(), end: (daterange!.end)?.endOf('day').toISOString()}).then((response:any) => {
            if(response.status){
                setDashboardStats(response.data)
            }
            setStatsLoader(false)
        }).catch((e) => {
            setStatsLoader(false)
            console.log(e.message)
        })
    }

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0}).then((response:any) => {
            const { list } = response
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name, status: e.status }
            })
            const activeGyms = rows.filter((e:any) => e.status === GLOBAL_STATUSES.ACTIVE)
            setGyms(activeGyms)
            if(activeGyms.length>0){
                setDefaultGymId(activeGyms[0])
            } else {
                setDefaultGymId({})
            }

            if(rows.length){
                if(!activeGyms.length){
                    setNoGyms(<><Link component={NavLink} to={ROUTES.BRAND.ACTIVATION(rows[0].brandId)} underline={'none'}>Activate your gym</Link> to manage your brand.</>)
                }
            }else {
                setNoGyms(<><Link component={NavLink} to={ROUTES.GYM.CREATE} underline={'none'}>Create gym</Link> to start your brand.</>)
            }
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchPayments = () => {
        if(!paymentsLoader) setPaymentsLoader(true)
        GetPayments({page: 0, limit: 0},{gymIds: [defaultGymId?.value], startDate: (daterange.start)?.startOf('day')?.toISOString(), endDate: (daterange.end)?.endOf('day')?.toISOString()}).then((response:any) => {
            try {
                const { list, paging } = response
                setPayments(list)
                setPaymentsLoader(false)
            }catch (e) {
                console.log(e)
            }
        }).catch(() => {
            setPaymentsLoader(false)
        })
    }

    const fetchExpenses = () => {
        if(!expenseLoader) setExpenseLoader(true)
        GetExpenses({page: 0, limit: 0}, {gymId: defaultGymId?.value, startDate: (daterange.start)?.format('YYYY-MM-DD'), endDate: (daterange.end)?.format('YYYY-MM-DD'), status: GLOBAL_STATUSES.ACTIVE}).then((response:any) => {
            try {
                const expenses = response.list
                const categoryMap = new Map();
                expenses.forEach(exp => {
                    if (!categoryMap.has(exp.categoryId)) {
                        categoryMap.set(exp.categoryId, { label: exp.expenseCategory.name, value: 0 })
                    }
                    categoryMap.get(exp.categoryId).value += exp.amount;
                });
                setExpenses(Array.from(categoryMap.values()))
                setExpenseLoader(false)
            }catch (e) {
                console.log(e)
            }
        }).catch(() => {
            setExpenseLoader(false)
        })
    }

    const fetchPTCommissions = () => {
        if(!ptCommLoader) setPTCommLoader(true)
        PTCommission({page: 0, limit: 0}, {gymId: defaultGymId?.value, settlement: false,startDate: (daterange.start)?.startOf('day')?.toISOString(), endDate: (daterange.end)?.endOf('day')?.toISOString()}).then((response:any) => {
            try {
                const ptCommissions = response.list
                const commissionMap = new Map();
                ptCommissions.forEach(comm => {
                    if (!commissionMap.has(comm.instructor.id)) {
                        commissionMap.set(comm.instructor.id, { label: comm.instructor.fullName, value: 0 })
                    }
                    commissionMap.get(comm.instructor.id).value += comm.amount;
                });
                setPTCommissions(Array.from(commissionMap.values()))
                setPTCommLoader(false)
            }catch (e) {
                console.log(e)
            }
        }).catch(() => {
            setPTCommLoader(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([])
        if(gymSelection){
            fetchGyms()
        }
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchStats()
            fetchPayments()
            fetchExpenses()
            fetchPTCommissions()
        }
    }, [defaultGymId, daterange]);

    return (
        <Box sx={{ mt: { xs: 0, sm: 2 } }}>
            <PageTitle title="Dashboard" input={filters} />
            {noGyms ? (
                <Alert severity="warning">{noGyms}</Alert>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 4 } }}>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <DashboardStat value={dashboardStats.totalRevenue} title="Total Revenue" icon={<TrendingUpIcon sx={{ color: '#fff' }} />} iconBg="primary.main" loading={statsLoader} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <DashboardStat value={dashboardStats.totalExpense} title="Total Expense" icon={<TrendingDownOutlinedIcon sx={{ color: '#fff' }} />} iconBg="triadic.main" loading={statsLoader} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <DashboardStat value={dashboardStats.totalPTCommission} title="Total PT Commission" icon={<AltRouteIcon sx={{ color: '#fff' }} />} iconBg="success.main" loading={statsLoader} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <DashboardStat value={dashboardStats.activeMemberships} title="Active Memberships" icon={<Diversity1Icon sx={{ color: '#fff' }} />} iconBg="warning.main" loading={statsLoader} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Stacking payments={payments} loading={paymentsLoader} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <PieChartGeneral data={expenses} innerRadius={80} title="Expense" loading={expenseLoader} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <PieChartGeneral data={ptCommissions} innerRadius={80} title="PT Commission" loading={ptCommLoader} />
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default Dashboard