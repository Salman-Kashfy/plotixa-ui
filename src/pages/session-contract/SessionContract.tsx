import {useContext, useEffect, useState} from 'react'
import {constants, PERMISSIONS, ROUTES, SESSION_CONTRACT_STATUS} from "../../utils/constants";
import {
    Box, Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    IconButton,
    TableRow,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {NavLink} from "react-router-dom";
import {GetSessionContract, GetSessionContracts, SaveSessionContract} from "../../services/session-contract.service";
import Link from "@mui/material/Link";
import {Fragment} from "react";
import dayjs from "dayjs";
import AddIcon from '@mui/icons-material/Add';
import {useForm} from "react-hook-form";
import SessionContractForm from "./SessionContractForm";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {hasPermission} from "../../utils/permissions";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {ToastContext} from "../../hooks/ToastContext";
import ContractInvoice from "./ContractInvoice";
import {PurchaseContract,PayContractPendingAmount} from "../../services/payment.service";
import {isEmpty} from "lodash";
import SessionContractCard from "./SessionContractCard";

function SessionContract({customer}) {
    const toastContext:any = useContext(ToastContext)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(true);
    const [purchaseloading, setPurchaseLoading] = useState(false);
    const [contractloading, setContractLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [dueModal, setDuesModal] = useState(false);
    const [upsertModal, setUpsertModal] = useState(false);

    const [sessionContractId, setSessionContractId] = useState('');
    const [billingModal, setBillingModal] = useState(false);
    const [billingLoading, setBillingLoading] = useState(false);

    const [create, setCreate] = useState(false);
    const [formLoader, setFormLoader] = useState(false);
    const [record, setRecord] = useState({});
    const columns = [
        { id: 'serviceName', label: 'Service', minWidth: 170 },
        { id: 'instructorName', label: 'Instructor', minWidth: 170 },
        { id: 'dateRange', label: 'Validity', minWidth: 170 },
        { id: 'remainingSessions', label: 'Count', minWidth: 100 },
        /*{ id: 'pendingAmount', label: 'Dues', minWidth: 100 },*/
        { id: 'isPaid', label: 'Payment Status', minWidth: 170 },
        { id: 'status', label: 'Contract Status', minWidth: 170 },
        { id: 'actions', label: 'Action', minWidth: 170 },
    ]
    const defaultValues = {
        id: '',
        startDate: '',
        serviceId: '',
        instructorId: '',
        customerId: ''
    }

    const {formState: {errors}} = useForm({
        mode: "onChange",
        defaultValues
    })

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleOpenSaveDialog = (create:boolean, id = null) => {
        setCreate(create)
        setUpsertModal(true);
        if(!create && id){
            setRecord({})
            fetchContract(id)
        }
    };

    const handleOpenInvoiceDialog = (sessionContractId) => {
        setSessionContractId(sessionContractId)
        setBillingLoading(true)
        setBillingModal(true)
    };

    const handleOpenDuesDialog = (sessionContractId) => {
        setSessionContractId(sessionContractId)
        setBillingLoading(true)
        setDuesModal(true)
    };

    const handleCloseDuesDialog = () => {
        setDuesModal(false)
    };

    const handleCloseInvoiceDialog = () => {
        setBillingModal(false)
    };

    const handleCloseSaveDialog = () => {
        setUpsertModal(false);
    };

    const onSubmit = (data) => {
        setContractLoading(true)
        SaveSessionContract(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage(create ? 'Created successfully.' : 'Updated successfully.')
                fetchRows()
                handleCloseSaveDialog()
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setContractLoading(false)
        })
    }

    const purchaseContract = (data) => {
        setPurchaseLoading(true)
        PurchaseContract(data).then((response) => {
            if(response.status){
                if(response.orderPrivateCoach.id){
                    toastContext.setToastSeverity('success')
                    toastContext.setToastMessage('Contract Purchased.')
                    fetchRows()
                    handleCloseSaveDialog()
                } else if (response.paymentUrl){
                    alert('PaymentURL received!')
                }
            } else {
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setBillingModal(false)
            setPurchaseLoading(false)
        })
    }

    const payContractDues = (data) => {
        setPurchaseLoading(true)
        PayContractPendingAmount(data).then((response) => {
            if(response.status){
                if(response.orderPrivateCoach.id){
                    toastContext.setToastSeverity('success')
                    toastContext.setToastMessage('Payment Successfull.')
                    fetchRows()
                    handleCloseDuesDialog()
                } else if (response.paymentUrl){
                    alert('PaymentURL received!')
                }
            } else {
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setDuesModal(false)
            setPurchaseLoading(false)
        })
    }

    useEffect(() => {
        if(!isEmpty(customer)){
            fetchRows()
        }
    }, [page,customer]);

    const statusColor = (status) => {
        switch (status) {
            case SESSION_CONTRACT_STATUS.NOT_STARTED:
                return 'primary'
            case SESSION_CONTRACT_STATUS.ACTIVE:
            case SESSION_CONTRACT_STATUS.STARTED:
                return 'success'
            case SESSION_CONTRACT_STATUS.ENDED:
            case SESSION_CONTRACT_STATUS.CANCELED:
                return 'warning'
            case SESSION_CONTRACT_STATUS.TERMINATED:
                return 'error'
            default:
                return ''
        }
    }

    const fetchContract = (id) => {
        setFormLoader(true)
        setContractLoading(true)
        GetSessionContract(id).then((row) => {
            setRecord(row)
            setFormLoader(false)
            setContractLoading(false)
        }).catch((e) => {
            setFormLoader(false)
            setContractLoading(false)
            console.log(e.message)
        })
    }

    const fetchRows = () => {
        if(!loading) setLoading(true)
        GetSessionContracts({page:page+1},{customerId:customer.id}).then((contracts:any) => {
            const { list, paging } = contracts
            const rows = list.map((e:any) => {
                e.pendingAmount = parseFloat(e.pendingAmount)
                return {
                    id: e.id,
                    service: e.service,
                    serviceName: <Link component={NavLink} to={ROUTES.SERVICE.VIEW(e.service.id)} underline={'none'}>{e.service.name}</Link>,
                    instructorName: e.instructor ? <Link component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(e.instructor.id)} underline={'none'}>{e.instructor.fullName}</Link> : '-',
                    dateRange: e.startDate === e.endDate ? dayjs(e.startDate).format("MMM DD, YYYY") : `${dayjs(e.startDate).format("MMM DD, YYYY")} - ${dayjs(e.endDate).format("MMM DD, YYYY")}`,
                    remainingSessions: e.remainingSessions+'/'+e.totalSessions,
                    pendingAmount: e.pendingAmount ? e.service.brand.country.currency.symbol+e.pendingAmount : 0,
                    isPaid: <Chip label={e.isPaid ? 'Paid' : (e.pendingAmount ? 'Partially Paid' : 'Unpaid')} color={ e.isPaid ? 'success' : (e.pendingAmount ? 'warning' : 'error') } />,
                    status: <Chip label={SESSION_CONTRACT_STATUS[e.status]} color={statusColor(e.status)}/>,
                    actions: <>
                        { hasPermission(PERMISSIONS.SESSION_CONTRACT.UPSERT) ?
                            <IconButton color={'warning'} disabled={e.isPaid} onClick={() => handleOpenSaveDialog(false, e.id)}>
                                <ModeEditIcon/>
                            </IconButton>
                            : <></>
                        }
                        {
                            !e.isPaid && !e.pendingAmount && hasPermission(PERMISSIONS.SESSION_CONTRACT.PAY) ?
                                <Button variant={'contained'} size="small" onClick={() => handleOpenInvoiceDialog(e.id)} sx={{ml:1}}>Pay Now</Button>
                                :<></>
                        }
                        {
                            !e.isPaid && e.pendingAmount && hasPermission(PERMISSIONS.SESSION_CONTRACT.PAY) ?
                                <Button variant={'contained'} size="small" onClick={() => handleOpenDuesDialog(e.id)} sx={{ml:1}}>Pay Dues</Button>
                                :<></>
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

    return (
        <Box>
            <Fragment>
                <Dialog open={dueModal} onClose={handleCloseDuesDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Contract Payment Dues</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                        <ContractInvoice
                            customerId={customer.id}
                            sessionContractId={sessionContractId}
                            billingLoading={billingLoading}
                            setBillingLoading={setBillingLoading}
                            loading={purchaseloading}
                            callback={payContractDues}
                        />
                    </DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={upsertModal} onClose={handleCloseSaveDialog} fullWidth maxWidth="sm">
                    <DialogTitle>{create ? 'Create Contract' : 'Update Contract'}</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><SessionContractForm loading={contractloading} record={!create ? record : {}} callback={onSubmit} formLoader={formLoader} btnLabel={create ? 'Create' : 'Save Changes'} customer={customer}/></DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={billingModal} onClose={handleCloseInvoiceDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Contract Payment</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                        <ContractInvoice
                            customerId={customer.id}
                            sessionContractId={sessionContractId}
                            billingLoading={billingLoading}
                            setBillingLoading={setBillingLoading}
                            loading={purchaseloading}
                            callback={purchaseContract}
                        />
                    </DialogContent>
                </Dialog>
            </Fragment>
            {
                hasPermission(PERMISSIONS.SESSION_CONTRACT.UPSERT) ?
                    <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mb: 2 }}>
                        <IconButton
                            sx={{
                                backgroundColor: "primary.main",
                                boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
                                color: theme.palette.mode === 'light' ? 'white' : 'black',
                                "&:hover": {
                                    backgroundColor: "primary.dark",
                                },
                            }}
                            onClick={() => handleOpenSaveDialog(true)}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                :<></>
            }

            {isMobile ? (
                <>
                    <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                        {rows.map((row) => (
                            <SessionContractCard key={row.id} row={row} columns={columns} />
                        ))}
                    </Stack>
                    {loading && !rows.length ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : null}
                    {!loading && !rows.length ? (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No contracts found
                        </Box>
                    ) : null}
                </>
            ) : (
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align={column?.align}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow hover key={row.id} sx={{ opacity: loading ? 0.2 : 1 }}>
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>{row[column.id]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                            <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                        </TableBody>
                        <TableFooter>
                            {loading ? (
                                <TableSpinner loading colSpan={columns.length} rowCount={rows.length} />
                            ) : null}
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
    )
}

export default SessionContract
