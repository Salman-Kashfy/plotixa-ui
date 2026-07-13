import {useContext, useEffect, useState, Fragment, useCallback} from "react";
import {
    Card,
    CardContent,
    Chip,
    IconButton,
    Box,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TablePagination,
    TableCell,
    TableFooter,
    InputLabel, MenuItem, FormControl,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {GetMemberships,CancelMembership as _CancelMembership} from "../../services/membership.service";
import dayjs from "dayjs";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {constants, CUSTOMER_TABS, GLOBAL_STATUSES, MEMBERSHIP_STATUS, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import {getAuthGym, hasPermission} from "../../utils/permissions";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {capitalize} from "lodash";
import {AdminContext} from "../../hooks/AdminContext";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {GetGyms} from "../../services/gym.service";
import ViewMembership from "./ViewMembership";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {GetCustomers} from "../../services/customer.service";
import {debounce} from "@mui/material/utils";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import PageTitle from "../../components/PageTitle";
import Tooltip from "@mui/material/Tooltip";
import ClearIcon from "@mui/icons-material/Clear";
import CancelMembership from "./CancelMembership";
import {ToastContext} from "../../hooks/ToastContext";
import Select from "@mui/material/Select";
import ListingCard from "../../components/ListingCard";

function AllMembership() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const [page, setPage] = useState(0)
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});

    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState({});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [status, setStatus] = useState('');
    const [endingInDays, setEndingInDays] = useState('');
    const [endedSinceDays, setEndedSinceDays] = useState('');

    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState([]);
    const [record, setRecord] = useState({});
    const [customer, setCustomer] = useState({});

    const columns = [
        { id: 'membershipPlan', label: 'Membership Plan', minWidth: 100 },
        { id: 'fullName', label: 'Customer', minWidth: 170 },
        { id: 'gym', label: 'Source Gym', minWidth: 170 },
        // { id: 'startDate', label: 'Joining Date', width: 190 },
        { id: 'endDate', label: 'Valid Till', width: 190 },
        { id: 'total', label: 'Total', minWidth: 100 },
        { id: 'championType', label: 'Scope', minWidth: 100 },
        // { id: 'createdBy', label: 'Created By', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 170 },
    ]

    /**
     * Cancel Membership
     * */
    const [cancelLoader, setCancelLoader] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const handleCancelMembershipDialog = (membership) => {
        setRecord(membership)
        setCustomer(membership.customer)
        setCancelModal(true)
    }

    /**
     * View Membership
     * */
    const [viewModal, setViewModal] = useState(false);
    const handleViewMembershipDialog = (membership) => {
        setRecord(membership)
        setCustomer(membership.customer)
        setViewModal(true)
    }

    const statusColor = (status) => {
        switch (status) {
            case MEMBERSHIP_STATUS.ACTIVE:
                return 'success'
            case MEMBERSHIP_STATUS.UPCOMING:
                return 'primary'
            case MEMBERSHIP_STATUS.CANCELLED:
            case MEMBERSHIP_STATUS.PENDING_PAYMENT:
                return 'warning'
            default:
                return ''
        }
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Memberships' }])
    }, []);

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomers([])
        setCustomerId({})
        setDefaultGymId(value)
    }

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomerId({label: value?.label, value: value?.value})
    }

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const handleEndingInDaysChange = (event) => {
        setEndingInDays(event.target.value);
        setPage(0);
    };

    const handleEndedForDaysChange = (event) => {
        setEndedSinceDays(event.target.value);
        setPage(0);
    };

    const fetchCustomers = (searchCustomer, gymId) => {
        setCustomerLoader(true)
        GetCustomers({page:1}, {gymId, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            setCustomers(list.map((e) => {
                return {
                    value: e.id,
                    label: e.fullName+' ('+e.customerCode+')'
                }
            }))
            setCustomerLoader(false)
        }).catch((e) => {
            setCustomerLoader(false)
            console.log(e.message)
        })
    }

    const cancelMembership = (data) => {
        setCancelLoader(true)
        _CancelMembership(data).then((response) => {
            if(response.status){
                fetchRows()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Cancelled Successfully.')
                setCancelModal(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setCancelLoader(false)
        }).catch((e) => {
            console.log(e)
            setCancelLoader(false)
        })
    }

    const fetchRows = () => {
        if(!loading) setLoading(true)
        GetMemberships({page:page+1},{gymId: defaultGymId.value, customerId: customerId?.value, status: status || undefined, endingInDays: endingInDays && status === MEMBERSHIP_STATUS.ACTIVE ? endingInDays : undefined, endedSinceDays: endedSinceDays && status === MEMBERSHIP_STATUS.ENDED ? endedSinceDays : undefined}).then((response:any) => {
            const { list, paging } = response
            const rows = list.map((e:any) => {
                e.pendingAmount = parseFloat(e.pendingAmount)
                const customer = e.leadCustomerDuplicate?.duplicateCustomer || e.customer
                return {
                    id: e.id,
                    membershipPlan: <Link component={NavLink} to={ROUTES.MEMBERSHIP_PLAN.VIEW(e.membershipPlanId)} underline={'none'}>{e.name}</Link>,
                    fullName: <Link component={NavLink} to={ROUTES.CUSTOMER.TAB(customer.id,CUSTOMER_TABS.DETAILS)} underline={'none'}>{customer.fullName + ' ('+customer.customerCode+')'}</Link>,
                    gym: <Link component={NavLink} to={ROUTES.GYM.VIEW(e.gymId)} underline={'none'}>{e.gym.name}</Link>,
                    endDate: e.endDate ? dayjs(e.endDate).format("MMM DD, YYYY hh:mm A") : '-',
                    // dateRange: e.startDate && e.endDate ? `${dayjs(e.startDate).format("MMM DD, YYYY hh:mm A")} - ${dayjs(e.endDate).format("MMM DD, YYYY hh:mm A")}` : dayjs(e.startDate).format("MMM DD, YYYY hh:mm A"),
                    total: e.customer.country.currency.symbol+e.total,
                    championType: capitalize(e.championType) || 'Local',
                    pendingAmount: e.pendingAmount ? e.customer.country.currency.symbol+e.pendingAmount : 0,
                    // createdBy: <Link component={NavLink} to={ROUTES.ADMIN.VIEW(e.createdBy.id)} underline={'none'}>{e.createdBy.fullName}</Link>,
                    status: <Chip label={e.pendingAmount && e.status === MEMBERSHIP_STATUS.PENDING_PAYMENT ? 'Partially Paid' : MEMBERSHIP_STATUS[e.status] } color={ statusColor(e.status) } />,
                    actions: <>
                        <IconButton color={'info'} onClick={() => handleViewMembershipDialog(e)}>
                            <VisibilityIcon/>
                        </IconButton>
                        { ( gymSelection || !e.leadCustomerDuplicate ) && hasPermission(PERMISSIONS.MEMBERSHIP.CANCEL) && [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.UPCOMING].includes(e.status) ?
                            <Tooltip title="Cancel Membership" placement={'top'}>
                                <IconButton color={'warning'} onClick={() => handleCancelMembershipDialog(e)}>
                                    <ClearIcon/>
                                </IconButton>
                            </Tooltip>
                            : <></>
                        }
                    </>
                }
            })
            setRows(rows)
            setPaging(paging)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }

    const debouncedFetchCustomer = useCallback(
        debounce(
            (searchCustomer: string, gymId: string) => {
                fetchCustomers(searchCustomer, gymId);
            },
            500
        ),
        []
    );

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    }

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer, defaultGymId.value)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }else{
            setRows([])
        }
    }, [page, customerId, defaultGymId, status, endingInDays, endedSinceDays]);

    return (
        <Box>
            <Fragment>
                <Dialog open={viewModal} onClose={() => setViewModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Membership Details</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><ViewMembership record={record} customer={customer} statusColor={statusColor}/></DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={cancelModal} onClose={() => setCancelModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Cancel Membership</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><CancelMembership record={record} customer={customer} loading={cancelLoader} callback={cancelMembership}/></DialogContent>
                </Dialog>
            </Fragment>
            <PageTitle title={'Memberships'}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        {
                            gymSelection ?
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Autocomplete
                                        id="gyms-dd"
                                        options={gyms}
                                        getOptionLabel={(option) => option.label || ''}
                                        onChange={handleGymChange}
                                        value={defaultGymId}
                                        loading={gymLoader}
                                        renderInput={(params) => <FormInput fullWidth={true} disabled={!gyms.length} label={'Gym'} params={params}
                                            slotProps={{
                                                input: {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <Fragment>
                                                            {gymLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </Fragment>
                                                    ),
                                                },
                                            }}
                                        />}
                                    />
                                </Grid>
                            : <></>
                        }
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                id="customer-dd"
                                options={customers}
                                value={customerId}
                                loading={customerLoader}
                                disabled={!defaultGymId?.value}
                                onInput={(event) => setSearchCustomer(event.target.value)}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleCustomerChange}
                                renderInput={(params) => <FormInput fullWidth={true} label={'Customer'} placeholder={'Search customers'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {customerLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Membership Status</InputLabel>
                                <Select label="Membership Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value={''}>Any</MenuItem>
                                    { Object.keys(MEMBERSHIP_STATUS).map((key:string) => {
                                        return (<MenuItem selected={status === key} value={key} key={key}>{capitalize(key)}</MenuItem>)
                                    }) }
                                </Select>
                            </FormControl>
                        </Grid>
                        {
                            status === MEMBERSHIP_STATUS.ACTIVE ?
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl variant={'standard'} fullWidth={true}>
                                        <InputLabel>Ending in</InputLabel>
                                        <Select label="Ending in" onChange={handleEndingInDaysChange} value={endingInDays}>
                                            <MenuItem value={''}>Any</MenuItem>
                                            <MenuItem selected={endingInDays === 1} value={1}>1 day</MenuItem>
                                            { [2,3].map((key:number) => {
                                                return (<MenuItem selected={endingInDays === key} value={key} key={key}>{key} days</MenuItem>)
                                            }) }
                                        </Select>
                                    </FormControl>
                                </Grid> : <></>
                        }
                        {
                            status === MEMBERSHIP_STATUS.ENDED ?
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl variant={'standard'} fullWidth={true}>
                                        <InputLabel>Ended Since</InputLabel>
                                        <Select label="Ended Since" onChange={handleEndedForDaysChange} value={endedSinceDays}>
                                            <MenuItem value={''}>Any</MenuItem>
                                            <MenuItem selected={endedSinceDays === 1} value={1}>1 day</MenuItem>
                                            { [3,7,30].map((key:number) => {
                                                return (<MenuItem selected={endedSinceDays === key} value={key} key={key}>{key} days</MenuItem>)
                                            }) }
                                        </Select>
                                    </FormControl>
                                </Grid> : <></>
                        }
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{p:3}}>
                    <Box>
                        {isMobile ? (
                            <>
                                <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                                    {rows.map((row) => (
                                        <ListingCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No memberships found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column?.align} sx={{width: column.width || undefined}}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody >
                                        <>
                                            {rows
                                                .map((row) => {
                                                    return (
                                                        <TableRow hover role="checkbox" key={row.id} sx={{opacity: loading ? 0.2 : 1 }}>
                                                            {columns.map((column) => {
                                                                const value = row[column.id];
                                                                return (
                                                                    <TableCell key={column.id} align={column.align}>{value}</TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })
                                            }
                                            <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                            <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                        </>
                                    </TableBody>
                                    <TableFooter>
                                        {loading ? <TableSpinner colSpan={columns.length}/> : <></>}
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            component="div"
                            count={paging.totalResultCount}
                            rowsPerPage={constants.PER_PAGE}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPageOptions={[]}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )

}
export default AllMembership