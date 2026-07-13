import {
    Autocomplete,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow,
    TextField, IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import {GetSubscriptionPayments, UpdatePaymentStatus} from "../../services/subscription.payment.service";
import {useContext, useEffect, useState} from "react";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import {constants, PAYMENT_STATUS, ROUTES} from "../../utils/constants";
import {NavLink} from "react-router-dom";
import Link from "@mui/material/Link";
import PageTitle from "../../components/PageTitle";
import {GetBrands} from "../../services/brand.service";
import Select from "@mui/material/Select";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {capitalize} from "lodash";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AppDialog from "../../components/AppDialog";
import {ToastContext} from "../../hooks/ToastContext";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

function SubscriptionPayment() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
    const [markPaymentStatus, setMarkPaymentStatus] = useState({});
    const [brands, setBrands] = useState([]);
    const [defaultBrandId, setDefaultBrandId] = useState({})
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [submitLoader, setSubmitLoader] = useState(false)
    const columns = [
        { id: 'brand', label: 'Brand' },
        { id: 'name', label: 'Subscription' },
        { id: 'amount', label: 'Amount' },
        { id: 'transactionId', label: 'Transaction ID' },
        { id: 'paymentScheme', label: 'Scheme' },
        { id: 'paymentStatus', label: 'Status' },
        { id: 'createdAt', label: 'Date' },
        { id: 'actions', label: 'Action' },
    ]

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Subscription Payments' }])
    }, []);

    const fetchBrands = () => {
        GetBrands({limit:0}).then((brands:any) => {
            const { list } = brands
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setBrands(rows)
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const handlePaymentStatusChange = (event) => {
        setPaymentStatus(event.target.value);
        setPage(0);
    }

    const handlePaymentDialog = (input) => {
        setMarkPaymentStatus(input);
        setPaymentDialog(true);
    }

    const handlePaymentDialogClose = (input) => {
        setMarkPaymentStatus({});
        setPaymentDialog(false);
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultBrandId(value)
    }

    const savePaymentStatus = () => {
        setSubmitLoader(true)
        UpdatePaymentStatus(markPaymentStatus).then((data) => {
            if(data.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
                fetchRows()
                setPaymentDialog(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(data.errorMessage)
            }
            toastContext.setToast(true)
            setSubmitLoader(false)
        }).catch((e) => {
            console.log(e)
            setSubmitLoader(false)
        })
    }

    const fetchRows = () => {
        GetSubscriptionPayments({page:page+1},{paymentStatus: paymentStatus || undefined, brandId: defaultBrandId?.value || undefined }).then((response) => {
            const { list, paging } = response
            const rows = list.map((e:any) => {
                return {
                    brand: <Link component={NavLink} to={ROUTES.BRAND.VIEW(e.brand.id)} underline={'none'}>{e.brand.name}</Link>,
                    name: e.subscriptionPaymentPlan.name,
                    amount: e.currencySymbol+e.amount,
                    transactionId: e.transactionId,
                    paymentScheme: e.paymentScheme,
                    paymentStatus: capitalize(e.paymentStatus.replace('_',' ')),
                    createdAt: dayjs(e.createdAt).format("MMM DD, YYYY hh:mm A"),
                    actions: <>
                        {
                           e.paymentStatus !== PAYMENT_STATUS.SUCCESS ?
                               <>
                                   <IconButton color={'success'} onClick={() => handlePaymentDialog({id:e.id, paymentStatus: PAYMENT_STATUS.SUCCESS})}>
                                       <TaskAltIcon/>
                                   </IconButton>
                                   {
                                       e.paymentStatus !== PAYMENT_STATUS.PENDING_PAYMENT ?
                                           <IconButton color={'error'} onClick={() => handlePaymentDialog({id:e.id, paymentStatus: PAYMENT_STATUS.PENDING_PAYMENT})}>
                                               <DoNotDisturbAltIcon/>
                                           </IconButton>
                                           :<></>
                                   }
                               </>
                               :<></>
                        }
                    </>
                }
            })
            setRows(rows)
            setPaging(paging)
        })
    }

    useEffect(() => {
        fetchBrands()
    }, []);

    useEffect(() => {
        fetchRows()
    }, [page, paymentStatus, defaultBrandId]);

    return (
        <>
            <PageTitle title={'Subscription Payment'}/>
            <AppDialog open={paymentDialog} handleDialogClose={handlePaymentDialogClose} title={'Payment Dialog'} body={'Mark selected transaction '+markPaymentStatus?.paymentStatus+'?'} dialogBtnLoading={submitLoader} dialogBtnLabel={'Confirm'} onSubmit={savePaymentStatus}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        <Grid size={4}>
                            <Autocomplete
                                id="brands-dd"
                                options={brands}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleBrandChange}
                                value={defaultBrandId}
                                renderInput={(params) => <TextField disabled={!brands.length} variant="standard" {...params} label="Brand" />}
                            />
                        </Grid>
                        <Grid size={4}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Payment Status</InputLabel>
                                <Select label="Payment Status" onChange={handlePaymentStatusChange} value={paymentStatus}>
                                    <MenuItem value={''}>Any</MenuItem>
                                    { Object.keys(PAYMENT_STATUS).map((key:string) => {
                                        return (<MenuItem selected={paymentStatus === key} value={key} key={key}>{capitalize(key.replace('_',' '))}</MenuItem>)
                                    }) }
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
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
                                                <TableRow hover role="checkbox" key={Math.random()} sx={{opacity: loading ? 0.2 : 1 }}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={Math.random()} align={column.align}>{value}</TableCell>
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
                    <TablePagination
                        component="div"
                        count={paging.totalResultCount}
                        rowsPerPage={constants.PER_PAGE}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPageOptions={[]}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default SubscriptionPayment