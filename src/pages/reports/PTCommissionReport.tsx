import {Fragment, useContext, useEffect, useState} from "react";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import {AdminContext} from "../../hooks/AdminContext";
import {constants, CUSTOMER_TABS, GLOBAL_STATUSES, ROLE, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, useMediaQuery, useTheme} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {getAuthGym} from "../../utils/permissions";
import {GetInstructors} from "../../services/instructor.service";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {PTCommission} from "../../services/commission.service";
import dayjs, {Dayjs} from "dayjs";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import {GetGyms} from "../../services/gym.service";
import {isEmpty,capitalize} from "lodash";
import {PickersShortcutsItem} from "@mui/x-date-pickers/PickersShortcuts";
import {DateRange} from "@mui/x-date-pickers-pro/models";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro/DateRangePicker";
import {SingleInputDateRangeField} from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import ListingCard from "../../components/ListingCard";
import { saveAs } from 'file-saver';

function PTCommissionReport() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [exportLoader, setExportLoader] = useState(false);
    const [daterange, setDaterange] = useState({start: dayjs().startOf('month'), end: dayjs().endOf('month')});

    const [instructors, setInstructors] = useState([]);
    const [instructorId, setInstructorId] = useState({});
    const [instructorLoader, setInstructorLoader] = useState(false);

    const btn = [
        {
            label: 'Export',
            onClick: exportCsv,
            loading: exportLoader,
            show: true,
            disabled: isEmpty(rows)
        },
    ]
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }
    const columns = [
        { id: 'instructor', label: 'Instructor', minWidth: 100 },
        { id: 'customer', label: 'Customer', minWidth: 100 },
        { id: 'service', label: 'Service', minWidth: 100 },
        { id: 'type', label: 'Type', minWidth: 100 },
        { id: 'percentage', label: 'Percent (%)', minWidth: 100 },
        { id: 'amount', label: currency.symbol ? 'Commission ('+currency.symbol+')' : 'Commission', minWidth: 100 },
        { id: 'settlement', label: 'Settlement' },
        { id: 'createdAt', label: 'Time', minWidth: 100 }
    ]
    const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
        {
            label: 'Today',
            getValue: () => {
                const today = dayjs();
                return [today, today];
            },
        },
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
        setDefaultGymId(value)
        setInstructors([])
        setInstructorId({})
    }

    const handleInstructorChange = (event: any, value: { value: string, label: string } | null) => {
        setInstructorId(value)
    }

    const fetchInstructors = (gymId) => {
        setInstructorLoader(true)
        GetInstructors({limit:0},{gymId}).then(({list}:any) => {
            setInstructors(list.map((e:any) => {
                return { value: e.id, label: e.fullName, selected: false }
            }))
            setInstructorLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const formatRows = (rows) => {
        return rows.map((e:any) => {
            return {
                id: e.id || `${e.instructor?.id}-${e.customer?.id}-${e.service?.id}-${e.createdAt}`,
                instructor: <Link component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(e.instructor.id)} underline={'none'}>{e.instructor.fullName}</Link>,
                instructorName: e.instructor.fullName,
                customer: <Link component={NavLink} to={ROUTES.CUSTOMER.TAB(e.customer.id,CUSTOMER_TABS.DETAILS)} underline={'none'}>{e.customer.fullName}</Link>,
                customerName: e.customer.fullName,
                service: <Link component={NavLink} to={ROUTES.SERVICE.VIEW(e.service.id)} underline={'none'}>{e.service.name}</Link>,
                serviceName: e.service.name,
                type: capitalize(e.type),
                percentage: e.percentage ? e.percentage+'%' : '-',
                amount: e.amount || '',
                settlement: e.settlement ? 'Yes' : '',
                createdAt: dayjs(e.createdAt).format("MMM DD, YYYY hh:mm A"),
                createdAtText: dayjs(e.createdAt).format("MMM DD YYYY hh:mm A")
            }
        })
    }

    const fetchRows = (gymId) => {
        if(!loading) setLoading(true)
        PTCommission({page:page+1},{gymId, instructorId:instructorId?.value || undefined, startDate: daterange.start?.startOf('day').toISOString(), endDate: daterange.end?.endOf('day').toISOString() }).then((response:any) => {
            try {
                const { list, paging } = response
                const rows = formatRows(list)
                setRows(rows)
                setPaging(paging)
                setLoading(false)
            }catch (e) {
                console.log(e)
            }
        }).catch(() => {
            setLoading(false)
        })
    }

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then((brands:any) => {
            const { list } = brands
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

    const handleDaterange = (values) => {
        let start = values[0], end = values[1]
        if(start && end){
            start = dayjs(values[0])
            end = dayjs(values[1])
            setDaterange({start,end})
        }else if(!start && !end){
            setDaterange({start: null, end: null})
        }
    }

    function exportCsv() {
        setExportLoader(true)
        const params = {gymId:defaultGymId.value, instructorId:instructorId?.value || undefined, startDate: daterange.start?.startOf('day').toISOString(), endDate: daterange.end?.endOf('day').toISOString() }
        PTCommission({page: 0, limit: 0}, params).then((response:any) => {
            try {
                const rows = response.list;
                /**
                 * Header
                 * */
                const csvColumns = [
                    { id: 'instructorName', label: 'Instructor' },
                    { id: 'customerName', label: 'Customer' },
                    { id: 'serviceName', label: 'Service' },
                    { id: 'type', label: 'Type' },
                    { id: 'percentage', label: 'Percent (%)' },
                    { id: 'amount', label: currency.code ? 'Commission ('+currency.code+')' : 'Commission' },
                    { id: 'settlement', label: 'Settlement' },
                    { id: 'createdAtText', label: 'Payment Time'}
                ]
                const csvRows = [];
                csvRows.push(csvColumns.map(col => `"${col.label}"`).join(','));

                /**
                * Calculate sum of commission for each individual instructor
                * */
                const instructorTotals = new Map();
                for (const row of rows) {
                    if (!instructorTotals.has(row.instructor.id)) {
                        instructorTotals.set(row.instructor.id, {
                            name: row.instructor.fullName,
                            total: row.amount
                        });
                        continue;
                    }
                    const current = instructorTotals.get(row.instructor.id);
                    instructorTotals.set(row.instructor.id, {
                        name: current.name,
                        total: current.total + row.amount
                    });
                }

                /**
                * Put commission records in csv
                * */
                const formattedRows = formatRows(rows)
                formattedRows.forEach((row: any) => {
                    csvRows.push(csvColumns.map(col => `"${row[col.id]}"`).join(','))
                })

                csvRows.push('', 'Individual Commission(s)', '');

                /**
                * Put instructor totals
                * */
                let grandTotal = 0;
                instructorTotals.forEach((value) => {
                    csvRows.push(`"${value.name}","${currency?.code+' '+value.total}","","","","",""`);
                    grandTotal += value.total;
                });

                /**
                 * Put grand total
                 * */
                csvRows.push('');
                csvRows.push('"","","","","","",""'); // Empty row
                csvRows.push(`"Grand Total","${currency?.code+' '+grandTotal}","","","","",""`);
                csvRows.push(`Gym,${defaultGymId.label || gyms.find((e:any) => e.value === defaultGymId.value).label}`)

                /**
                 * Trigger download using Blob
                 * */
                let daterangeStr = ''
                if(daterange.start && daterange.end){
                    daterangeStr = `${dayjs(daterange.start).format("MMM DD YYYY")} - ${dayjs(daterange.end).format("MMM DD YYYY")}`
                    csvRows.push(`Daterange,${daterangeStr}`)
                }else{
                    csvRows.push(`Daterange, Not specified`)
                }

                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, `PT Commission Report${daterangeStr ? ' - '+daterangeStr : ''}.csv`);
            }catch (e) {
                console.log(e)
            }
            setExportLoader(false)
        }).catch((e) => {
            setExportLoader(false)
            console.log('Something went wrong',e)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'PT Commissions' }])
        fetchGyms()
    }, [])

    useEffect(() => {
        if(defaultGymId?.value){
            fetchInstructors(defaultGymId?.value)
        }
    }, [defaultGymId])

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows(defaultGymId?.value)
        }else{
            setRows([])
        }
    }, [page,defaultGymId,daterange,instructorId]);

    return (
        <>
            <PageTitle title={'PT Commission'} btn={btn}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        {
                            gymSelection ?
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Autocomplete
                                id="instructors-dd"
                                options={instructors}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleInstructorChange}
                                value={instructorId}
                                loading={instructorLoader}
                                renderInput={(params) => <FormInput fullWidth={true} disabled={!instructors.length} label={'Instructor'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {instructorLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    slots={{ field: SingleInputDateRangeField }}
                                    name="allowedRange"
                                    defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
                                    format="MMM DD, YYYY"
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
                                        No PT commissions found
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
        </>
    )
}
export default PTCommissionReport