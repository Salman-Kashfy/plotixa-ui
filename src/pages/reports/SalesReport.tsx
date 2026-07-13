import {Fragment, useContext, useEffect, useState} from "react";
import {
    constants,
    GLOBAL_STATUSES,
    ORDER_TYPE,
    ORDER_TYPE_NAME,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    ROLE,
    ROUTES
} from "../../utils/constants";
import {AdminContext} from "../../hooks/AdminContext";
import {GetGyms} from "../../services/gym.service";
import PageTitle from "../../components/PageTitle";
import {Box, Card, CardContent, Checkbox, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, useMediaQuery, useTheme} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {getAuthGym} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {GetPayments} from "../../services/payment.service";
import dayjs, { Dayjs } from 'dayjs';
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ViewPayment from "../payment/ViewPayment";
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash';
import SearchForm from "../../components/SearchForm";
import ListingCard from "../../components/ListingCard";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function SalesReport() {
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
    const [saleTypes, setSaleTypes] = useState([]);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [record, setRecord] = useState({});
    const [paymentModal, setPaymentModal] = useState(false);
    const [exportLoader, setExportLoader] = useState(false);
    const [daterange, setDaterange] = useState({start: dayjs().startOf('month'), end: dayjs().endOf('month')});
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }
    const columns = [
        { id: 'invoiceNo', label: 'Invoice No.', minWidth: 100 },
        { id: 'orderType', label: 'Order Type', minWidth: 100 },
        { id: 'name', label: 'Name', minWidth: 100 },
        { id: 'amount', label: currency.symbol ? 'Amount ('+currency.symbol+')' : 'Amount', minWidth: 100 },
        { id: 'paymentMode', label: 'Payment Mode', minWidth: 100 },
        { id: 'paymentStatus', label: 'Payment Status', minWidth: 100 },
        { id: 'createdAt', label: 'Payment Time', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]
    const csvColumns = [
        { id: 'invoiceNo', label: 'Invoice No.' },
        { id: 'orderType', label: 'Order Type' },
        { id: 'nameText', label: 'Name' },
        { id: 'amount', label: currency.code ? 'Amount ('+currency.code+')' : 'Amount' },
        { id: 'paymentMode', label: 'Payment Mode' },
        { id: 'paymentStatusText', label: 'Payment Status' },
        { id: 'createdAtText', label: 'Payment Time'}
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
        { label: 'Reset', getValue: () => [null, null] },
    ];
    const btn = {
        label: 'Export',
        show: true,
        onClick: exportSales,
        loading: exportLoader,
        disabled: isEmpty(rows)
    }

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultGymId(value)
    }

    function exportSales() {
        setExportLoader(true)
        GetPayments({page: 0, limit: 0},{gymIds: [defaultGymId?.value], invoiceNo, startDate: daterange.start, endDate: daterange.end, orderTypes: saleTypes.length ? saleTypes.filter((e:any) => e.selected === true).map((e:any) => e.value) : undefined}).then((response:any) => {
            try {
                const { list } = response
                const rows = formatRows(list)
                const csvRows = [];
                csvRows.push(csvColumns.map(col => `"${col.label}"`).join(','));
                rows.forEach(row => {
                    const line = csvColumns.map(col => `"${row[col.id] ?? ''}"`).join(',');
                    csvRows.push(line);
                });

                const summary = {};
                let grandTotalSales = 0;
                let grandTotalRefund = 0;

                for (const row of rows) {
                    const type = row.orderType || 'UNKNOWN';
                    const isRefund = row.amount < 0;

                    if (!summary[type]) {
                        summary[type] = { sales: 0, refunds: 0 };
                    }

                    if (isRefund) {
                        summary[type].refunds += Math.abs(row.amount);
                        grandTotalRefund += Math.abs(row.amount);
                    } else {
                        summary[type].sales += row.amount;
                        grandTotalSales += row.amount;
                    }
                }

                // Add spacing
                csvRows.push('', '');
                csvRows.push('Order Type,Total Sales,Total Refund');

                Object.entries(summary).forEach(([type, data]) => {
                    csvRows.push(`"${type}","${data.sales.toFixed(2)}","${data.refunds.toFixed(2)}"`);
                });

                csvRows.push('', `"Grand Total Sales",${(currency?.code+' '+(grandTotalSales.toFixed(2))).trim()}`);
                csvRows.push(`"Grand Total Refund",${(currency?.code+' '+grandTotalRefund.toFixed(2)).trim()}`);
                csvRows.push(`"Net Sales",${(currency?.code+' '+(grandTotalSales - grandTotalRefund).toFixed(2)).trim()}`);

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
                saveAs(blob, `Sales Report${daterangeStr ? ' - '+daterangeStr : ''}.csv`);
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
    };

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

    const handleOpenPaymentDialog = (payment) => {
        setRecord(payment)
        setPaymentModal(true)
    }

    const handleClosePaymentDialog = () => {
        setPaymentModal(false)
    }

    const handleSearchInvoice = (value) => {
        setInvoiceNo(value.trim());
        setPage(0);
    };

    const statusColor = (status) => {
        switch (status) {
            case PAYMENT_STATUS.SUCCESS:
                return 'success'
            case PAYMENT_STATUS.PENDING:
            case PAYMENT_STATUS.REFUNDED:
            case PAYMENT_STATUS.PENDING_PAYMENT:
                return 'warning'
            case PAYMENT_STATUS.FAILURE:
                return 'error'
            default:
                return ''
        }
    }

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows(defaultGymId?.value)
        }else{
            setRows([])
        }
    }, [page,defaultGymId,saleTypes,daterange,invoiceNo]);
    
    const formatRows = (rows) => {
        return rows.map((e:any) => {
            const obj = {
                id: e.id,
                invoiceNo: e.invoiceNo,
                orderType: ORDER_TYPE_NAME[e.orderType],
                amount: e.amount,
                amountWithCurrency: e.isSplitPayment ? (e.currencySymbol+e.amount)+' / '+(e.currencySymbol+e.orderPrivateCoach.total) : (e.currencySymbol+e.amount),
                paymentMode: PAYMENT_METHOD[e.paymentMethod.paymentScheme],
                paymentStatusText: e.paymentStatus,
                paymentStatus: <Chip label={e.paymentStatus} color={statusColor(e.paymentStatus)} />,
                createdAt: dayjs(e.createdAt).format("MMM DD, YYYY hh:mm A"),
                createdAtText: dayjs(e.createdAt).format("MMM DD YYYY hh:mm A"),
                actions: <>
                    <IconButton color={'primary'} onClick={() => handleOpenPaymentDialog(e)}>
                        <VisibilityIcon/>
                    </IconButton>
                </>
            }
            switch (e.orderType) {
                case ORDER_TYPE.PRIVATE_COACH:
                    obj.nameText = e.orderPrivateCoach.name
                    obj.name = <Link component={NavLink} to={ROUTES.SERVICE.VIEW(e.orderPrivateCoach.sessionContract.serviceId)} underline={'none'}>{e.orderPrivateCoach.name}</Link>
                    break
                case ORDER_TYPE.GYM_CLASS:
                    obj.nameText = e.orderGymClass.name
                    obj.name = <Link component={NavLink} to={ROUTES.CLASS_SCHEDULE.VIEW(e.orderGymClass.scheduleGroupId)} underline={'none'}>{e.orderGymClass.name}</Link>
                    break
                case ORDER_TYPE.MEMBERSHIP:
                    obj.nameText = e.membership.name
                    obj.name = <Link component={NavLink} to={ROUTES.MEMBERSHIP_PLAN.VIEW(e.membership.membershipPlanId)} underline={'none'}>{e.membership.name}</Link>
                    break
            }
            return obj
        })
    }

    const fetchRows = (gymId) => {
        if(!loading) setLoading(true)
        GetPayments({page:page+1},{gymIds: [gymId], invoiceNo, startDate: daterange.start?.startOf('day').toISOString(), endDate: daterange.end?.endOf('day').toISOString(), orderTypes: saleTypes.length ? saleTypes.filter((e:any) => e.selected === true).map((e:any) => e.value) : undefined}).then((response:any) => {
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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Sales' }])
        fetchGyms()
        setSaleTypes(Object.keys(ORDER_TYPE).map((e:any) => {
            return {
                label: ORDER_TYPE_NAME[e],
                value: e,
                selected: false,
            }
        }))
    }, [])

    return (
        <>
            <PageTitle title={'Sales'} btn={btn}/>
            <Fragment>
                <Dialog open={paymentModal} onClose={handleClosePaymentDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Payment Invoice</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><ViewPayment payment={record}/></DialogContent>
                </Dialog>
            </Fragment>
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
                            <SearchForm callback={handleSearchInvoice} label={'Search Invoice No.'}/>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                multiple
                                id="checkboxes-sale-types"
                                options={saleTypes}
                                value={saleTypes.filter((e) => e.selected === true)}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.label}
                                onChange={(event, newValue) => {
                                    setSaleTypes(saleTypes.map((e) => {
                                        e.selected = newValue.some((_e) => _e.value === e.value)
                                        return e
                                    }))
                                }}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.label}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => <FormInput fullWidth={true} label={'Sale Type'} params={params}/>}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                                        No sales found
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

export default SalesReport