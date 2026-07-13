import {useEffect, useState, useContext, Fragment, useCallback, useMemo} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {constants,CUSTOMER_MEMBERSHIP_STATUS,CUSTOMER_TABS,GLOBAL_STATUSES,PERMISSIONS,ROLE,ROLE_NAMES,ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {getAuthGym, hasPermission} from "../../utils/permissions";
import {GymQrSessions,SaveGymQrSession} from "../../services/gym.qr.session.service";
import {GetGyms} from "../../services/gym.service";
import dayjs, {Dayjs} from "dayjs";
import Grid from "@mui/material/Grid2";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import Autocomplete from "@mui/material/Autocomplete";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    useMediaQuery,
} from "@mui/material";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {AdminContext} from "../../hooks/AdminContext";
import {PickersShortcutsItem} from "@mui/x-date-pickers/PickersShortcuts";
import {DateRange} from "@mui/x-date-pickers-pro/models";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro/DateRangePicker";
import {SingleInputDateRangeField} from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import {GetCustomers} from "../../services/customer.service";
import {debounce} from "@mui/material/utils";
import Paper, {PaperProps} from "@mui/material/Paper";
import * as React from "react";
import Draggable from "react-draggable";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import GymQrSessionForm from "./GymQrSessionForm";
import {ToastContext} from "../../hooks/ToastContext";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import {capitalize,first,isEmpty} from "lodash";
import {GetAdmins} from "../../services/admin.service";
import {useTheme} from "@mui/material/styles";
import {red} from "@mui/material/colors";
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import AvatarWithLoader from '../../components/AvatarWithLoader';
import AppDialog from '../../components/AppDialog';
import ListingCard from '../../components/ListingCard';
import { saveAs } from 'file-saver';

function PaperComponent(props: PaperProps) {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} ref={nodeRef} />
        </Draggable>
    );
}

function GymQrSession() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [exportLoader, setExportLoader] = useState(false);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [daterange, setDaterange] = useState({start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });

    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState({});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const [attendanceModal, setAttendanceModal] = useState(false);
    const [attendanceLoader, setAttendanceLoader] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [adminId, setAdminId] = useState({});
    const [adminLoader, setAdminLoader] = useState(false);

    /**
    * Customer Image Dialog
    **/
    const [imageDialog, setImageDialog] = useState(false);  
    const [imageTitle, setImageTitle] = useState('');
    const [imageContent, setImageContent] = useState<React.ReactNode>('');

    /**
    * Auto-refresh functionality
    **/
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    const btn = [
        {
            icon: <AddIcon/>,
            backgroundColor: 'primary',
            show: hasPermission(PERMISSIONS.GYM_QR_SESSION.UPSERT),
            disabled: !defaultGymId?.value,
            onClick: () => setAttendanceModal(true)
        },
        {
            icon: <CloudDownloadIcon/>,
            backgroundColor: 'success',
            show: true,
            onClick: exportAttendance,
            loading: exportLoader,
            disabled: isEmpty(rows)
        },
        {
            icon: <RefreshIcon/>,
            show: true,
            onClick: () => fetchRows(),
            loading
        }
    ]
    const columns = [
        { id: 'fullName', label: 'Name', minWidth: 140 },
        { id: 'bioDate', label: 'Date', minWidth: 100 },
        { id: 'checkIn', label: 'Check in', minWidth: 100 },
        { id: 'checkOut', label: 'Check out', minWidth: 100 },
        { id: 'overtimeIn', label: 'Overtime in' },
        { id: 'overtimeOut', label: 'Overtime out' },
        { id: 'type', label: 'Type' },
    ]
    const csvColumns = [
        { id: 'fullNameText', label: 'Name', minWidth: 140 },
        { id: 'bioDate', label: 'Date', minWidth: 100 },
        { id: 'checkIn', label: 'Check in', minWidth: 100 },
        { id: 'checkOut', label: 'Check out', minWidth: 100 },
        { id: 'overtimeIn', label: 'Overtime in' },
        { id: 'overtimeOut', label: 'Overtime out' },
        { id: 'type', label: 'Type' },
    ]
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
            label: 'Current Month',
            getValue: () => {
                const today = dayjs();
                return [today.startOf('month'), today.endOf('month')];
            },
        },
        { label: 'Reset', getValue: () => [null, null] },
    ];

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomers([])
        setCustomerId({})
        setDefaultGymId(value)
        if(value?.value){
            fetchAdmins(value.value)
        }else {
            setAdmins([])
        }
    }

    const handleDaterange = ([start, end]: [Dayjs | null, Dayjs | null]) => {
        if (start) {
            const cappedEnd = end && end.diff(start, 'day') > 30 ? start.add(31, 'day') : end ?? start.add(30, 'day');
            setDaterange({ start:start.format('YYYY-MM-DD'), end: cappedEnd.format('YYYY-MM-DD') });
        } else {
            setDaterange({ start: null, end: null });
        }
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomerId({label: value?.label, value: value?.value})
    }

    const handleAdminChange = (event: any, value: { value: string, label: string } | null) => {
        setAdminId({label: value?.label, value: value?.value})
    }

    const formatRows = useCallback((rows:any) => {
        return rows.map((e:any, index:number) => {
            const obj:any = {
                id: e.id || `${e.customerId || e.adminId}-${e.bioDate}-${index}`,
                bioDate: dayjs(e.bioDate).format('MMM DD, YYYY'),
                checkIn:e.checkIn ? dayjs(e.bioDate+' '+e.checkIn).format('hh:mm A') : '',
                checkOut:e.checkOut ? dayjs(e.bioDate+' '+e.checkOut).format('hh:mm A') : '',
                overtimeIn:e.overtimeIn ? dayjs(e.bioDate+' '+e.overtimeIn).format('hh:mm A') : '',
                overtimeOut:e.overtimeOut ? dayjs(e.bioDate+' '+e.overtimeOut).format('hh:mm A') : '',
                type: capitalize(e.type),
                imageUrl: e.customer?.imageUrl || e.admin?.imageUrl,
            }
            obj.membershipStatus = e.admin ? CUSTOMER_MEMBERSHIP_STATUS.MEMBER : e.customer?.membershipStatus
            obj.fullNameText = e.customerId ? e.customer.fullName + '('+e.customer.customerCode+')' : e.admin.fullName
            const nameLink = e.customerId ?
                <Link component={NavLink} to={ROUTES.CUSTOMER.TAB(e.customerId,CUSTOMER_TABS.DETAILS)} underline={'none'} sx={{color: theme.palette.mode === 'dark' && obj.membershipStatus !== CUSTOMER_MEMBERSHIP_STATUS.MEMBER ? theme.palette.common.white : undefined}}>{e.customer.fullName}</Link> :
                <Link component={NavLink} to={ROUTES.ADMIN.VIEW(e.adminId)} underline={'none'}>{e.admin.fullName}</Link>
            obj.fullName = (
                <>
                    <AvatarWithLoader
                        src={obj.imageUrl || ''}
                        alt={obj.fullNameText}
                        sx={{ mr: 1, verticalAlign: 'middle' }}
                        onClick={() => {
                            if (!obj.imageUrl) return
                            setImageTitle(obj.fullNameText || '')
                            setImageContent(<img src={obj.imageUrl} alt={obj.fullNameText || ''} style={{ height: 'auto', maxHeight: 350, maxWidth: '100%' }} />)
                            setImageDialog(true)
                        }}
                    />
                    {nameLink}
                </>
            )

            return obj
        })
    },[theme.palette.mode])

    const formattedRows = useMemo(() => formatRows(rows),[rows, formatRows])

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then(({list}:any) => {
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setGyms(rows)
            if(rows.length>0){
                setDefaultGymId(rows[0])
            }
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

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

    function exportAttendance() {
        if(!exportLoader) setExportLoader(true)
        const params = { gymId: defaultGymId.value, customerId:customerId.value, adminId:adminId.value, startDate: daterange.start, endDate: daterange.end }
        GymQrSessions({limit:0}, params).then((services:any) => {
            const { list } = services
            const rows = formatRows(list)
            const csvRows = [];
            csvRows.push(csvColumns.map(col => `"${col.label}"`).join(','));
            rows.forEach(row => {
                const line = csvColumns.map(col => `"${row[col.id] ?? ''}"`).join(',');
                csvRows.push(line);
            });
            csvRows.push('');
            csvRows.push(`Gym,${defaultGymId.label || gyms.find((e:any) => e.value === defaultGymId.value).label}`)

            let daterangeStr = ''
            if(daterange.start && daterange.end){
                daterangeStr = `${dayjs(daterange.start).format("MMM DD YYYY")} - ${dayjs(daterange.end).format("MMM DD YYYY")}`
                csvRows.push(`"Daterange ",${daterangeStr}`);
            }else{
                csvRows.push(`"Daterange ", Not specified`);
            }

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `Attendance Report${daterangeStr ? ' - '+daterangeStr : ''}.csv`);

        }).catch(() => {
            setExportLoader(false)
        })
    }

    const fetchAdmins = (gymId) => {
        setAdminLoader(true)
        GetAdmins({limit:0}, {gymId}).then((response:any) => {
            const { list } = response
            setAdmins(list.filter((e) => first(e.roles).name !== ROLE_NAMES.BRAND_ADMIN)
                .map((e: any) => ({ value: e.id, label: e.fullName, selected: false })))
            setAdminLoader(false)
        }).catch((e) => {
            setAdminLoader(false)
            console.log(e.message)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Attendance' }])
        fetchGyms()
        if(gymSelection){
            fetchAdmins(defaultGymId?.value)
        }
    }, []);

    const debouncedFetchCustomer = useCallback(
        debounce(
            (searchCustomer: string, gymId: string) => {
                fetchCustomers(searchCustomer, gymId);
            },
            500
        ),
        []
    );

    function fetchRows() {
        if(!loading) setLoading(true)
        if(!daterange.start || !daterange.end) return
        const params = { gymId: defaultGymId.value, customerId:customerId.value, adminId:adminId.value, startDate: daterange.start, endDate: daterange.end }
        GymQrSessions({page:page+1}, params).then((services:any) => {
            const { list, paging } = services
            try {
                setRows(list)
                setPaging(paging)
                setLoading(false)
            }catch (e) {
                console.log(e)
            }

        }).catch(() => {
            setLoading(false)
        })
    }

    const markAttendance = (data) => {
        data.bioTime = dayjs(data.bioTime).format('HH:mm:ss')
        setAttendanceLoader(true)
        SaveGymQrSession(data).then((data) => {
            if(data.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Saved: '+data.saved+' Already Exists: '+data.exists)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(data.errorMessage)
            }
            setAttendanceModal(false)
            fetchRows()
            toastContext.setToast(true)
            setAttendanceLoader(false)
        }).catch((e) => {
            setAttendanceLoader(false)
            console.log(e)
        })
    }

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }else{
            setRows([])
        }
    }, [page, customerId, adminId, defaultGymId, daterange]);

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer, defaultGymId.value)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    // Auto-refresh effect
    useEffect(() => {
        if (defaultGymId?.value && daterange.start && daterange.end) {
            const interval = setInterval(() => {
                fetchRows();
            }, 8000); // 10 seconds
            
            setRefreshInterval(interval);
            
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [defaultGymId?.value, daterange.start, daterange.end]);

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    useEffect(() => {

    }, [theme.palette.mode]);

    return (
        <>
            <Fragment>
                <Dialog
                    open={attendanceModal}
                    aria-hidden={!attendanceModal}
                    aria-labelledby="draggable-dialog-title"
                    PaperComponent={PaperComponent}
                    fullWidth
                    maxWidth="sm"
                    sx={{
                        '& .MuiDialog-paper': {
                            m: { xs: 1.5, sm: 2 },
                            width: { xs: 'calc(100% - 24px)', sm: undefined },
                        },
                    }}
                >
                    <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
                        Mark Attendance
                    </DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                        <Box sx={{ width: '100%' }}>
                            <GymQrSessionForm loading={attendanceLoader} gymId={defaultGymId?.value} _admins={admins} close={() => setAttendanceModal(false)} callback={markAttendance}/>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <PageTitle title={'Attendance'} btn={btn}/>
            <AppDialog open={imageDialog} handleDialogClose={() => setImageDialog(false)} title={imageTitle} body={imageContent} dialogBtnLabel={'Close'} />
            
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
                            <Autocomplete
                                id="admin-dd"
                                options={admins}
                                value={adminId}
                                loading={adminLoader}
                                disabled={!defaultGymId?.value}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleAdminChange}
                                renderInput={(params) => <FormInput fullWidth={true} label={'Admin'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {adminLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    slots={{ field: SingleInputDateRangeField }}
                                    format="MMM DD, YYYY"
                                    maxDate={dayjs(daterange.start).add(30, 'day')}
                                    defaultValue={[dayjs(),dayjs()]}
                                    label="Select Daterange"
                                    onChange={handleDaterange}
                                    slotProps={{
                                        textField: {
                                            variant: 'standard',
                                            sx:{width:'100%'},
                                        },
                                        shortcuts: {
                                            items: shortcutsItems,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{p:3}}>
                    <Box>
                        {isMobile ? (
                            <>
                                <Stack spacing={2} sx={{ opacity: loading && formattedRows.length ? 0.5 : 1 }}>
                                    {formattedRows.map((row) => (
                                        <ListingCard
                                            key={row.id}
                                            row={row}
                                            columns={columns}
                                            sx={{
                                                bgcolor: row.membershipStatus !== CUSTOMER_MEMBERSHIP_STATUS.MEMBER
                                                    ? (theme.palette.mode === 'dark' ? red['A400'] : red[100])
                                                    : undefined,
                                                color: theme.palette.mode === 'dark' && row.membershipStatus !== CUSTOMER_MEMBERSHIP_STATUS.MEMBER
                                                    ? theme.palette.common.white
                                                    : undefined,
                                            }}
                                        />
                                    ))}
                                </Stack>
                                {loading && !formattedRows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !formattedRows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No attendance found
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
                                                    align={column?.align}
                                                    style={{ minWidth: column.minWidth }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <>
                                            {formattedRows
                                                .map((row) => {
                                                    return (
                                                        <TableRow hover role="checkbox" key={row.id} sx={{opacity: loading ? 0.2 : 1}}>
                                                            {columns.map((column) => {
                                                                const value = row[column.id];
                                                                const backgroundColor = row.membershipStatus !== CUSTOMER_MEMBERSHIP_STATUS.MEMBER ? (theme.palette.mode === 'dark' ? red['A400'] : red[100]) : undefined
                                                                return (
                                                                    <TableCell key={`${row.id}-${column.id}`} align={column.align} sx={{backgroundColor, color: theme.palette.mode === 'dark' && row.membershipStatus !== CUSTOMER_MEMBERSHIP_STATUS.MEMBER ? theme.palette.common.white : 'inherit'}}>
                                                                        {value}
                                                                    </TableCell>
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
        </>
    )
}

export default GymQrSession