import {Fragment, useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {constants, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import IconButton from "@mui/material/IconButton";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PageTitle from "../../components/PageTitle";
import {getAuthGym, hasPermission} from "../../utils/permissions";
import {
    Box,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {GetExpenseCategories, GetExpenses, UpdateExpense} from "../../services/expense.service";
import {GetGyms} from "../../services/gym.service";
import dayjs, {Dayjs} from "dayjs";
import {AdminContext} from "../../hooks/AdminContext";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro/DateRangePicker";
import {SingleInputDateRangeField} from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import {PickersShortcutsItem} from "@mui/x-date-pickers/PickersShortcuts";
import {DateRange} from "@mui/x-date-pickers-pro/models";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import EditExpense from "./EditExpense";
import {ToastContext} from "../../hooks/ToastContext";
import {isEmpty} from 'lodash';
import ListingCard from "../../components/ListingCard";
import { saveAs } from 'file-saver';

function Expense() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [gyms, setGyms] = useState([]);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [expenseCategoryId, setExpenseCategoryId] = useState(null);
    const [daterange, setDaterange] = useState({start: dayjs(), end: dayjs()});
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const [exportLoader, setExportLoader] = useState(false);
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }

    /**
     * Update Expense
     * */
    const [expense, setExpense] = useState({});
    const [updateModal, setUpdateModal] = useState(false);
    const [updateLoader, setUpdateLoader] = useState(false);

    const btn = [
        {
            to: ROUTES.EXPENSE.CREATE,
            label: 'Create Expense',
            show: hasPermission(PERMISSIONS.EXPENSE.UPSERT),
        },
        {
            label: 'Export',
            onClick: exportExpense,
            loading: exportLoader,
            show: true,
            disabled: isEmpty(rows) || status === GLOBAL_STATUSES.INACTIVE
        },
    ]
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'amount', label: currency.symbol ? 'Amount ('+currency.symbol+')' : 'Amount', minWidth: 170 },
        { id: 'date', label: 'Date', minWidth: 170 },
        { id: 'actions', label: 'Action', minWidth: 100 },
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
    }

    const handleExpenseChange = (event: any, value: { value: string, label: string } | null) => {
        setExpenseCategoryId(value)
    }

    function exportExpense() {
        setExportLoader(true)
        const params = { status, gymId: defaultGymId.value, categoryId: expenseCategoryId?.value || undefined, startDate: daterange?.start?.format('YYYY-MM-DD'), endDate: daterange?.end?.format('YYYY-MM-DD') }
        GetExpenses({page: 0, limit: 0}, params).then((response:any) => {
            try {
                const expenses = response.list;
                /**
                * Header
                * */
                const csvColumns = [
                    { id: 'name', label: 'Expense' },
                    { id: 'amount', label: currency.code ? 'Amount ('+currency.code+')' : 'Amount'  },
                    { id: 'date', label: 'Date' }
                ]
                const csvRows = [];
                csvRows.push(csvColumns.map(col => `"${col.label}"`).join(','));

                /**
                * Add all individual expenses
                * */
                expenses.forEach(row => {
                    csvRows.push(`${row.expenseCategory.name},${row.amount},${dayjs(row.date).format("MMM DD YYYY")}`);
                });
                csvRows.push('', 'Categorized Total', '');

                /**
                * Category totals
                * */
                const categoryMap = new Map();
                expenses.forEach(exp => {
                    if (!categoryMap.has(exp.categoryId)) {
                        categoryMap.set(exp.categoryId, { name: exp.expenseCategory.name, total: 0 })
                    }
                    categoryMap.get(exp.categoryId).total += exp.amount;
                });

                /**
                * Convert map to array and sort by total descending
                * */
                const sortedCategories = Array.from(categoryMap.values())
                    .sort((a, b) => b.total - a.total);
                sortedCategories.forEach(cat => {
                    csvRows.push(`${cat.name},${cat.total}`);
                });

                /**
                * Grand total
                * */
                const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
                csvRows.push('','')
                csvRows.push(`Grand Total,${(currency?.code+' '+grandTotal).trim()}`)
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
                saveAs(blob, `Expense Report${daterangeStr ? ' - '+daterangeStr : ''}.csv`);

            }catch (e) {
                console.log(e)
            }
            setExportLoader(false)
        }).catch((e) => {
            setExportLoader(false)
            console.log('Something went wrong',e)
        })
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handleOpenUpdateDialog = (e) => {
        setExpense(e);
        setUpdateModal(true);
    }

    const handleCloseUpdateDialog  = () => {
        setUpdateModal(false);
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

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const fetchExpenseCategories = () => {
        GetExpenseCategories()
            .then(({ list }: any) => {
                const parents = list.filter((e: any) => e.parentId === null);
                const parentMap = new Map(parents.map((p: any) => [p.id, p.name]));

                const childrenWithGroup = list
                    .filter((e: any) => e.parentId !== null)
                    .map((e: any) => ({
                        value: e.id,
                        label: e.name,
                        group: parentMap.get(e.parentId) || 'Uncategorized',
                    }));
                setExpenseCategories(childrenWithGroup);
            })
            .catch((e) => {
                console.log(e.message);
            });
    };

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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Expenses' }])
        fetchGyms()
        fetchExpenseCategories()
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }
    }, [page, status, defaultGymId, expenseCategoryId, daterange]);

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { status, gymId: defaultGymId.value, categoryId: expenseCategoryId?.value || undefined, startDate: daterange?.start?.format('YYYY-MM-DD'), endDate: daterange?.end?.format('YYYY-MM-DD') }
        if(!status) delete params.status
        GetExpenses({page:page+1}, params).then((services:any) => {
            const { list, paging } = services
            const rows = list.map((e:any) => {
                return {
                    id: e.id,
                    name: e.expenseCategory.name,
                    amount: e.amount,
                    date: dayjs(e.date).format('MMM DD, YYYY'),
                    actions: <>
                        { hasPermission(PERMISSIONS.EXPENSE.UPSERT) ?
                            <IconButton onClick={() => handleOpenUpdateDialog(e)} color={'warning'}>
                                <ModeEditIcon/>
                            </IconButton>
                        : <></>}
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

    const _updateExpense = (data) => {
        setUpdateLoader(true)
        UpdateExpense(data).then((response) => {
            if(response.status){
                fetchRows()
                handleCloseUpdateDialog()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setUpdateLoader(false)
        }).catch((e) => {
            console.log(e)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Something went wrong!')
            toastContext.setToast(true)
            setUpdateLoader(false)
        })
    }

    return (
        <>
            <Fragment>
                <Dialog open={updateModal} onClose={handleCloseUpdateDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Update Expense</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                        <EditExpense record={expense} callback={_updateExpense} loading={updateLoader} gymSelection={gymSelection} expenseCategories={expenseCategories} gyms={gyms}/>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <PageTitle title={'Expenses'} to={ROUTES.EXPENSE.CREATE} btn={btn}/>
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
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    slots={{ field: SingleInputDateRangeField }}
                                    name="allowedRange"
                                    defaultValue={[dayjs(), dayjs()]}
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                value={expenseCategoryId}
                                options={expenseCategories.sort((a, b) => a.group.localeCompare(b.group))}
                                groupBy={(option) => option.group}
                                getOptionLabel={(option) => option.label}
                                onChange={handleExpenseChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Expense Category" variant={'standard'} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value={''}>ANY</MenuItem>
                                    { Object.keys(GLOBAL_STATUSES).map((key:string) => {
                                        return (<MenuItem selected={status === key} value={key} key={key}>{key}</MenuItem>)
                                    }) }
                                </Select>
                            </FormControl>
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
                                        No expenses found
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
        </>
    )
}

export default Expense
