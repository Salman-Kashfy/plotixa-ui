import { useEffect, useState } from 'react';
import { constants, ORDER_TYPE, ORDER_TYPE_NAME, PAYMENT_METHOD, PAYMENT_STATUS, ROUTES } from '../../utils/constants';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    IconButton,
    TableRow,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import { Fragment } from 'react';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { GetPayments } from '../../services/payment.service';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { isEmpty } from 'lodash';
import ViewPayment from './ViewPayment';
import { NavLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import PaymentCard from './PaymentCard';

function Payment({ customer }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState({});
    const [paymentModal, setPaymentModal] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const columns = [
        { id: 'invoiceNo', label: 'Invoice No.', minWidth: 100 },
        { id: 'orderType', label: 'Type', minWidth: 100 },
        { id: 'name', label: 'Name', minWidth: 100 },
        { id: 'paidAmount', label: 'Total', minWidth: 100 },
        { id: 'paymentMode', label: 'Mode', minWidth: 100 },
        { id: 'paymentStatus', label: 'Status', minWidth: 100 },
        { id: 'createdAt', label: 'Time', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ];

    const handleOpenPaymentDialog = (payment) => {
        setRecord(payment);
        setPaymentModal(true);
    };

    const handleClosePaymentDialog = () => {
        setPaymentModal(false);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const statusColor = (status) => {
        switch (status) {
            case PAYMENT_STATUS.SUCCESS:
                return 'success';
            case PAYMENT_STATUS.PENDING:
            case PAYMENT_STATUS.REFUNDED:
            case PAYMENT_STATUS.PENDING_PAYMENT:
                return 'warning';
            case PAYMENT_STATUS.FAILURE:
                return 'error';
            default:
                return 'default';
        }
    };

    useEffect(() => {
        if (!isEmpty(customer)) {
            fetchRows();
        }
    }, [page, customer]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        GetPayments({ page: page + 1 }, { customerId: customer.id, gymIds: [customer.gymId] })
            .then((contracts: any) => {
                try {
                    const { list, paging: nextPaging } = contracts;
                    const nextRows = list.map((e: any) => {
                        const obj: any = {
                            id: e.id,
                            invoiceNo: e.invoiceNo,
                            orderType: ORDER_TYPE_NAME[e.orderType],
                            paidAmount: e.isSplitPayment
                                ? e.currencySymbol + e.amount + ' / ' + (e.currencySymbol + e.orderPrivateCoach.total)
                                : e.currencySymbol + e.amount,
                            paymentMode: PAYMENT_METHOD[e.paymentMethod.paymentScheme],
                            paymentStatus: (
                                <Chip label={e.paymentStatus} color={statusColor(e.paymentStatus)} />
                            ),
                            createdAt: dayjs(e.createdAt).format('MMM DD, YYYY hh:mm A'),
                            actions: (
                                <IconButton color="primary" onClick={() => handleOpenPaymentDialog(e)}>
                                    <VisibilityIcon />
                                </IconButton>
                            ),
                        };
                        switch (e.orderType) {
                            case ORDER_TYPE.PRIVATE_COACH:
                                obj.name = (
                                    <Link
                                        component={NavLink}
                                        to={ROUTES.SERVICE.VIEW(e.orderPrivateCoach.sessionContract.serviceId)}
                                        underline="none"
                                    >
                                        {e.orderPrivateCoach.name}
                                    </Link>
                                );
                                break;
                            case ORDER_TYPE.GYM_CLASS:
                                obj.name = (
                                    <Link
                                        component={NavLink}
                                        to={ROUTES.CLASS_SCHEDULE.VIEW(e.orderGymClass.scheduleGroupId)}
                                        underline="none"
                                    >
                                        {e.orderGymClass.name}
                                    </Link>
                                );
                                break;
                            case ORDER_TYPE.MEMBERSHIP:
                                obj.name = (
                                    <Link
                                        component={NavLink}
                                        to={ROUTES.MEMBERSHIP_PLAN.VIEW(e.membership.membershipPlanId)}
                                        underline="none"
                                    >
                                        {e.membership.name}
                                    </Link>
                                );
                                break;
                            default:
                                obj.name = '-';
                        }
                        return obj;
                    });
                    setRows(nextRows);
                    setPaging(nextPaging);
                    setLoading(false);
                } catch (e) {
                    console.log(e);
                    setLoading(false);
                }
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return (
        <Box>
            <Fragment>
                <Dialog open={paymentModal} onClose={handleClosePaymentDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Payment Invoice</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
                        <ViewPayment payment={record} />
                    </DialogContent>
                </Dialog>
            </Fragment>
            {isMobile ? (
                <>
                    <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                        {rows.map((row) => (
                            <PaymentCard key={row.id} row={row} columns={columns} />
                        ))}
                    </Stack>
                    {loading && !rows.length ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : null}
                    {!loading && !rows.length ? (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No payments found
                        </Box>
                    ) : null}
                </>
            ) : (
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
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
                            <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length} />
                            <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length} />
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
    );
}

export default Payment;
