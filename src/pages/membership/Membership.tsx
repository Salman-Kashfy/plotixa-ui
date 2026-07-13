import {Fragment, useContext, useEffect, useState} from "react";
import {ToastContext} from "../../hooks/ToastContext";
import {Box, Button, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, useTheme, useMediaQuery, CircularProgress} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {constants, MEMBERSHIP_STATUS, PERMISSIONS, ROUTES} from "../../utils/constants";
import MembershipInvoice from "./MembershipInvoice";
import RenewMembership from "./RenewMembership";
import {PurchaseMembership, CustomerMemberships, PayMembershipPendingAmount, CancelMembership as _CancelMembership, RenewMembership as _RenewMembership} from "../../services/membership.service";
import {hasPermission} from "../../utils/permissions";
import dayjs from "dayjs";
import {NavLink} from "react-router-dom";
import Link from "@mui/material/Link";
import * as React from "react";
import {isEmpty,capitalize} from "lodash";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewMembership from "./ViewMembership";
import ClearIcon from '@mui/icons-material/Clear';
import CancelMembership from "./CancelMembership";
import Tooltip from "@mui/material/Tooltip";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MembershipCard from './MembershipCard';

function Membership({customer}) {
    const toastContext:any = useContext(ToastContext)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [page, setPage] = useState(0)
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([]);
    const [membershipLoader, setMembershipLoader] = useState(false);
    const [record, setRecord] = useState({});
    const columns = [
        { id: 'membershipPlan', label: 'Membership Plan', minWidth: 100 },
        // { id: 'startDate', label: 'Joining Date', width: 190 },
        { id: 'endDate', label: 'Valid Till', width: 190 },
        { id: 'total', label: 'Total', minWidth: 100 },
        { id: 'championType', label: 'Scope', minWidth: 100 },
        { id: 'createdBy', label: 'Sales By', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    }

    /**
    * Purchase Membership
    * */
    const [billingModal, setBillingModal] = useState(false);
    const [dueModal, setDuesModal] = useState(false);

    const handleBillingDialog = (toggle:boolean) => {
        if(!toggle && membershipLoader) return
        setBillingModal(toggle)
    }

    const handleDuesDialog = (toggle:boolean) => {
        if(!toggle && membershipLoader) return
        setDuesModal(toggle)
    }

    const handleOpenInvoiceDialog = (membership) => {
        setRecord(membership)
        setDuesModal(true)
    }

    /**
     * View Membership
     * */
    const [viewModal, setViewModal] = useState(false);
    const handleViewMembershipDialog = (membership) => {
        setRecord(membership)
        setViewModal(true)
    }

    /**
     * Cancel Membership
     * */
    const [cancelLoader, setCancelLoader] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const handleCancelMembershipDialog = (membership) => {
        setRecord(membership)
        setCancelModal(true)
        setCancelLoader(false)
    }

    /**
     * Renew Membership
     * */
    const [renewLoader, setRenewLoader] = useState(false);
    const [renewModal, setRenewModal] = useState(false);
    const handleRenewCloseDialog = () => {
        setRecord({})
        setRenewModal(false)
    }
    const handleRenewMembershipDialog = (membership) => {
        setRecord(membership)
        setRenewModal(true)
        setRenewLoader(false)
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

    const fetchRows = () => {
        if(!loading) setLoading(true)
        CustomerMemberships({page:page+1},{customerId:customer.id, gymId: customer.gym.id}).then((response:any) => {
            const { list, paging } = response
            const rows = list.map((e:any) => {
                e.pendingAmount = parseFloat(e.pendingAmount)
                return {
                    id: e.id,
                    membershipPlan: e.name,
                    // startDate: dayjs(e.startDate).format("MMM DD, YYYY hh:mm A"),
                    endDate: e.endDate ? dayjs(e.endDate).format("MMM DD, YYYY hh:mm A") : '-',
                    total: customer.country.currency.symbol+e.total,
                    championType: capitalize(e.championType) || 'Local',
                    pendingAmount: e.pendingAmount ? customer.country.currency.symbol+e.pendingAmount : 0,
                    createdBy: <Link component={NavLink} to={ROUTES.ADMIN.VIEW(e.createdBy.id)} underline={'none'}>{e.createdBy.fullName}</Link>,
                    status: <Chip label={e.pendingAmount && e.status === MEMBERSHIP_STATUS.PENDING_PAYMENT ? 'Partially Paid' : MEMBERSHIP_STATUS[e.status] } color={ statusColor(e.status) } />,
                    actions: <>
                        { hasPermission(PERMISSIONS.MEMBERSHIP.LIST) ?
                            <IconButton color={'info'} onClick={() => handleViewMembershipDialog(e)}>
                                <VisibilityIcon/>
                            </IconButton>
                            : <></>
                        }
                        { hasPermission(PERMISSIONS.MEMBERSHIP.CANCEL) && [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.UPCOMING].includes(e.status) ?
                            <Tooltip title="Cancel Membership" placement={'top'}>
                                <IconButton color={'warning'} onClick={() => handleCancelMembershipDialog(e)}>
                                    <ClearIcon/>
                                </IconButton>
                            </Tooltip>
                            : <></>
                        }
                        { hasPermission(PERMISSIONS.MEMBERSHIP.PURCHASE) && [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.ENDED].includes(e.status) ?
                            <Tooltip title="Renew Membership" placement={'top'}>
                                <IconButton color={'success'} onClick={() => handleRenewMembershipDialog(e)}>
                                    <AutorenewIcon/>
                                </IconButton>
                            </Tooltip>
                            : <></>
                        }
                        {
                            e.pendingAmount && e.status === MEMBERSHIP_STATUS.PENDING_PAYMENT && hasPermission(PERMISSIONS.MEMBERSHIP.PURCHASE) ?
                                <Button variant={'contained'} size="small" onClick={() => handleOpenInvoiceDialog(e)} sx={{ml:1}}>Pay Now</Button>
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

    const purchaseMembership = (data) => {
        setMembershipLoader(true)
        PurchaseMembership(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Membership Purchased.' )
                fetchRows()
                handleBillingDialog(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setMembershipLoader(false)
        }).catch((e) => {
            console.log(e)
            setMembershipLoader(false)
        })
    }

    const payMembershipDues = (data) => {
        const _data = {
            membershipId: data.id,
            paymentMethod: data.paymentMethod,
            amount: data.amount
        }
        setMembershipLoader(true)
        PayMembershipPendingAmount(_data).then((response) => {
            if(response.status){
                if(response.membership.id){
                    toastContext.setToastSeverity('success')
                    toastContext.setToastMessage('Payment Successfull.')
                    fetchRows()
                    handleDuesDialog(false)
                } else if (response.paymentUrl){
                    alert('PaymentURL received!')
                }
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setMembershipLoader(false)
        }).catch((e) => {
            console.log(e)
            setMembershipLoader(false)
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

    const renewMembership = (data) => {
        setRenewLoader(true)
        _RenewMembership(data).then((response) => {
            if(response.status){
                fetchRows()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Renewed Successfully.')
                setRenewModal(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setRenewLoader(false)
        }).catch((e) => {
            console.log(e)
            setRenewLoader(false)
        })
    }

    useEffect(() => {
        if(!isEmpty(customer)){
            fetchRows()
        }
    }, [page,customer]);

    return (
        <Box>
            <Fragment>
                <Dialog open={billingModal} onClose={() => handleBillingDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Buy Membership</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><MembershipInvoice record={record} loading={membershipLoader} callback={purchaseMembership} btnLabel={'Pay'} customer={customer}/></DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={dueModal} onClose={() => handleDuesDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Membership Payment Dues</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><MembershipInvoice record={record} loading={membershipLoader} callback={payMembershipDues} btnLabel={'Pay'} customer={customer}/></DialogContent>
                </Dialog>
            </Fragment>
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
            <Fragment>
                <Dialog open={renewModal} onClose={() => handleRenewCloseDialog()} fullWidth maxWidth="sm">
                    <DialogTitle>Renew Membership</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}><RenewMembership record={record} customer={customer} loading={renewLoader} callback={renewMembership}/></DialogContent>
                </Dialog>
            </Fragment>
            {
                hasPermission(PERMISSIONS.MEMBERSHIP.PURCHASE) ?
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
                            onClick={() => handleBillingDialog(true)}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                :<></>
            }
            {isMobile ? (
                <>
                    <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                        {rows.map((row) => (
                            <MembershipCard key={row.id} row={row} columns={columns} />
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
                                        align={column?.align}
                                        sx={{ width: column.width || undefined }}
                                    >
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

export default Membership