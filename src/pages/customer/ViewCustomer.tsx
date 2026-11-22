import { useContext, useEffect, useState, type SyntheticEvent } from 'react';
import {
    Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card,
    CardContent, Chip, CircularProgress, Divider, IconButton, Stack, Tab, Tabs,
    Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography,
    Dialog, DialogActions, DialogContent, DialogTitle,
    useMediaQuery, useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import LoadingButton from '@mui/lab/LoadingButton';
import dayjs, { Dayjs } from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UndoIcon from '@mui/icons-material/Undo';
import BookingIcon from '@mui/icons-material/EventAvailable';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AdminContext } from '../../hooks/AdminContext';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import PageTitle from '../../components/PageTitle';
import AppDialog from '../../components/AppDialog';
import ListingCard from '../../components/ListingCard';
import { GetCustomer, type Customer } from '../../services/customer.service';
import { GetBookings, GetBooking } from '../../services/booking.service';
import { GetTokens, UpsertToken, RefundToken, getTokenExpiresInDays } from '../../services/token.service';
import { GetPayments, type Payment } from '../../services/payment.service';
import { hasPermission } from '../../utils/permissions';
import TokenForm from '../token/TokenForm';
import {
    PERMISSIONS, ROUTES, TOKEN_STATUS, TOKEN_STATUS_COLOR,
} from '../../utils/constants';

type TabPanelProps = {
    active: boolean;
    children: React.ReactNode;
};

function TabPanel({ active, children }: TabPanelProps) {
    if (!active) return null;
    return <Box sx={{ pt: 3 }}>{children}</Box>;
}

function CustomerDetails({ customer }: { customer: Customer }) {
    const details = [
        { label: 'First Name', value: customer.firstName },
        { label: 'Last Name', value: customer.lastName },
        { label: 'Phone', value: `${customer.phoneCode} ${customer.phoneNumber}` },
    ];

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Customer Details</Typography>
                <Grid container spacing={3}>
                    {details.map((detail) => (
                        <Grid key={detail.label} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="caption" color="text.secondary">{detail.label}</Typography>
                            <Typography variant="body1" fontWeight={500}>{detail.value || '—'}</Typography>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}

function CustomerTokens({ customer }: { customer: Customer }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext: any = useContext(AdminContext);
    const toastContext: any = useContext(ToastContext);
    const projectUuid = adminContext.projectUuid || '';
    const currencyCode = adminContext.projects?.find(
        (project: any) => project.uuid === projectUuid,
    )?.currencyCode || '';
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingToken, setEditingToken] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [refundTarget, setRefundTarget] = useState<any | null>(null);
    const [refunding, setRefunding] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const loadTokens = async () => {
            setLoading(true);
            setError('');
            const matchingTokens: any[] = [];

            try {
                let page = 1;
                let totalPages = 1;
                do {
                    const response: any = await GetTokens({ page, perPage: 100 }, projectUuid);
                    const list = response.data?.list || [];
                    matchingTokens.push(...list.filter((token: any) =>
                        (token.customer?.uuid || token.customer?.id) === customer.uuid,
                    ));
                    totalPages = response.data?.pagination?.totalPages || 1;
                    page += 1;
                } while (page <= totalPages);

                if (active) setTokens(matchingTokens);
            } catch {
                if (active) setError('Unable to load customer tokens. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadTokens();
        return () => { active = false; };
    }, [customer.uuid, projectUuid, refreshKey]);

    const openCreateDialog = () => {
        setEditingToken(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (saving) return;
        setDialogOpen(false);
        setEditingToken(null);
    };

    const saveToken = (data: any) => {
        setSaving(true);
        UpsertToken(data)
            .then((response) => {
                if (!response.status) {
                    toastContext.setToastSeverity('error');
                    toastContext.setToastMessage(
                        response.message || response.errorMessage || 'Unable to save token.',
                    );
                    toastContext.setToast(true);
                    return;
                }

                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(
                    response.message || (editingToken ? 'Token updated successfully.' : 'Token created successfully.'),
                );
                toastContext.setToast(true);
                setDialogOpen(false);
                setEditingToken(null);
                setRefreshKey((key) => key + 1);
            })
            .catch(() => {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Unable to save token. Please try again.');
                toastContext.setToast(true);
            })
            .finally(() => setSaving(false));
    };

    const refundToken = () => {
        if (!refundTarget) return;
        setRefunding(true);
        RefundToken(refundTarget.uuid || refundTarget.id, projectUuid)
            .then((response) => {
                if (!response.status) {
                    toastContext.setToastSeverity('error');
                    toastContext.setToastMessage(
                        response.message || response.errorMessage || 'Unable to refund token.',
                    );
                    toastContext.setToast(true);
                    return;
                }
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(response.message || 'Token refunded successfully.');
                toastContext.setToast(true);
                setRefundTarget(null);
                setRefreshKey((key) => key + 1);
            })
            .catch(() => {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Unable to refund token. Please try again.');
                toastContext.setToast(true);
            })
            .finally(() => setRefunding(false));
    };

    const tokenColumns = [
        { id: 'plot', label: 'Plot', minWidth: 120 },
        { id: 'category', label: 'Category', minWidth: 120 },
        { id: 'amount', label: 'Amount', minWidth: 120 },
        { id: 'status', label: 'Status', minWidth: 110 },
        { id: 'expiresIn', label: 'Expires In', minWidth: 100 },
        { id: 'actions', label: 'Actions', minWidth: 80 },
    ];

    const tokenRows = tokens.map((token) => ({
        id: token.uuid || token.id,
        plot: token.plotName || (token.plot?.block?.name
            ? `${token.plot.block.name} - ${token.plot.plotNo}`
            : `Plot ${token.plot?.plotNo || '—'}`),
        category: token.plot?.category?.name || '—',
        amount: `${currencyCode} ${Number(token.amount || 0).toLocaleString()}`,
        status: (
            <Chip
                label={token.status}
                color={TOKEN_STATUS_COLOR[token.status as TOKEN_STATUS] || 'default'}
                size="small"
            />
        ),
        expiresIn: `${getTokenExpiresInDays(token.status, token.expiredAt)} days`,
        actions: (
            <Box sx={{ display: 'flex' }}>
                {token.status === TOKEN_STATUS.ACTIVE && hasPermission(PERMISSIONS.BOOKING.CREATE) ? (
                    <IconButton
                        component={NavLink}
                        to={`${ROUTES.BOOKING.CREATE}?tokenUuid=${encodeURIComponent(token.uuid || token.id)}`}
                        color="primary"
                        size="small"
                        aria-label="Create booking"
                    >
                        <BookingIcon fontSize="small" />
                    </IconButton>
                ) : null}
                {token.status !== TOKEN_STATUS.REFUNDED && hasPermission(PERMISSIONS.TOKEN.UPDATE) ? (
                    <IconButton
                        onClick={() => setRefundTarget(token)}
                        color="warning"
                        size="small"
                        aria-label="Refund token"
                    >
                        <UndoIcon fontSize="small" />
                    </IconButton>
                ) : null}
            </Box>
        ),
    }));

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Tokens</Typography>
                    {hasPermission(PERMISSIONS.TOKEN.CREATE) ? (
                        <Button onClick={openCreateDialog} variant="contained" size="small">
                            Create Token
                        </Button>
                    ) : null}
                </Box>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {loading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : !tokens.length && !error ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No tokens found for this customer.
                    </Typography>
                ) : (
                    isMobile ? (
                        <Stack spacing={2}>
                            {tokenRows.map((row) => (
                                <ListingCard key={row.id} row={row} columns={tokenColumns} />
                            ))}
                        </Stack>
                    ) : (
                        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <Table stickyHeader sx={{ minWidth: 680 }}>
                                <TableHead>
                                    <TableRow>
                                        {tokenColumns.map((column) => (
                                            <TableCell key={column.id} sx={{ minWidth: column.minWidth }}>
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tokenRows.map((row) => (
                                        <TableRow hover key={row.id}>
                                            {tokenColumns.map((column) => (
                                                <TableCell key={column.id}>{row[column.id]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </CardContent>
            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
                <DialogTitle>{editingToken ? 'Edit Token' : 'Create Token'}</DialogTitle>
                <DialogContent dividers>
                    <TokenForm
                        key={editingToken?.uuid || editingToken?.id || 'create'}
                        data={editingToken || {}}
                        customer={customer}
                        callback={saveToken}
                        formId="customer-token-form"
                        loading={saving}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
                    <LoadingButton
                        type="submit"
                        form="customer-token-form"
                        variant="contained"
                        loading={saving}
                        disabled={saving}
                    >
                        {editingToken ? 'Update Token' : 'Create Token'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <AppDialog
                open={Boolean(refundTarget)}
                handleDialogClose={() => !refunding && setRefundTarget(null)}
                title="Refund Token"
                body={`Refund ${currencyCode} ${Number(refundTarget?.amount || 0).toLocaleString()} for this token?`}
                dialogBtnLoading={refunding}
                dialogBtnLabel="Refund"
                onSubmit={refundToken}
            />
        </Card>
    );
}

function CustomerBookings({ customer }: { customer: Customer }) {
    const adminContext: any = useContext(AdminContext);
    const projectUuid = adminContext.projectUuid || '';
    const currencyCode = adminContext.projects?.find(
        (project: any) => project.uuid === projectUuid,
    )?.currencyCode || '';
    const [bookings, setBookings] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [bookingDetails, setBookingDetails] = useState<Record<string, any>>({});
    const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
    const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        GetBookings(
            { page: page + 1, perPage: 10 },
            { projectUuid, customerUuid: customer.uuid },
        ).then((response: any) => {
            if (!active) return;
            setBookings(response.data?.list || []);
            setPaging(response.data?.pagination || paging);
        }).catch(() => {
            if (active) setError('Unable to load customer bookings. Please try again.');
        }).finally(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, [customer.uuid, page, projectUuid]);

    const toggleBooking = (bookingId: string) => async (_event: SyntheticEvent, open: boolean) => {
        setExpanded((current) => ({ ...current, [bookingId]: open }));
        if (!open || bookingDetails[bookingId]) return;

        setDetailLoading((current) => ({ ...current, [bookingId]: true }));
        setDetailErrors((current) => ({ ...current, [bookingId]: '' }));
        try {
            const details = await GetBooking(bookingId, projectUuid);
            setBookingDetails((current) => ({ ...current, [bookingId]: details }));
        } catch {
            setDetailErrors((current) => ({
                ...current,
                [bookingId]: 'Unable to load the installment plan.',
            }));
        } finally {
            setDetailLoading((current) => ({ ...current, [bookingId]: false }));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={28} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Stack spacing={1.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {!bookings.length && !error ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No bookings found for this customer.
                        </Typography>
                    </CardContent>
                </Card>
            ) : null}
            {bookings.map((booking) => {
                const id = booking.uuid || booking.id;
                const details = bookingDetails[id] || booking;
                const installments = details.installments || [];
                return (
                    <Accordion
                        key={id}
                        expanded={Boolean(expanded[id])}
                        onChange={toggleBooking(id)}
                        disableGutters
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', width: '100%' }}>
                                <Typography fontWeight={600}>
                                    Plot {booking.plot?.plotNo || '—'}
                                </Typography>
                                <Typography color="text.secondary">
                                    {booking.tenureMonths || 0} months
                                </Typography>
                                <Typography color="primary.main" fontWeight={600}>
                                    {currencyCode} {Number(booking.plotPrice || 0).toLocaleString()}
                                </Typography>
                                <Chip
                                    label={booking.status}
                                    color={booking.status === 'active'
                                        ? 'success'
                                        : booking.status === 'completed'
                                            ? 'primary'
                                            : 'default'}
                                    size="small"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Divider sx={{ mb: 2 }} />
                            {detailLoading[id] ? (
                                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : detailErrors[id] ? (
                                <Alert severity="error">{detailErrors[id]}</Alert>
                            ) : installments.length ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Month</TableCell>
                                                <TableCell>Due Date / Label</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {installments.map((installment: any) => (
                                                <TableRow key={installment.uuid || installment.id || installment.month}>
                                                    <TableCell>{installment.month}</TableCell>
                                                    <TableCell>{installment.label || '—'}</TableCell>
                                                    <TableCell align="right">
                                                        {currencyCode} {Number(installment.amount || 0).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="text.secondary">No installment plan is available.</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
            {paging.total > 0 ? (
                <TablePagination
                    component="div"
                    count={paging.total}
                    rowsPerPage={paging.perPage}
                    page={page}
                    onPageChange={(_event, nextPage) => setPage(nextPage)}
                    rowsPerPageOptions={[]}
                />
            ) : null}
        </Stack>
    );
}

function CustomerPayments({ customer }: { customer: Customer }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext: any = useContext(AdminContext);
    const projectUuid = adminContext.projectUuid || '';
    const currencyCode = adminContext.projects?.find(
        (project: any) => project.uuid === projectUuid,
    )?.currencyCode || '';
    const [page, setPage] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const filters: { customerUuid: string; startDate?: string; endDate?: string } = {
            customerUuid: customer.uuid,
        };
        if (dateRange[0]) filters.startDate = dateRange[0].format('YYYY-MM-DD');
        if (dateRange[1]) filters.endDate = dateRange[1].format('YYYY-MM-DD');

        setLoading(true);
        setError('');
        GetPayments({ page: page + 1, perPage: 20 }, projectUuid, filters)
            .then((response) => {
                if (!active) return;
                setPayments(response.list);
                setTotal(response.pagination.total);
            })
            .catch(() => {
                if (active) setError('Unable to load customer payments. Please try again.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [customer.uuid, dateRange, page, projectUuid]);

    const handleDateRangeChange = (values: DateRange<Dayjs>) => {
        setDateRange(values);
        setPage(0);
    };

    const columns = [
        { id: 'type', label: 'Type', minWidth: 110 },
        { id: 'plot', label: 'Plot', minWidth: 120 },
        { id: 'amount', label: 'Amount', minWidth: 120 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'date', label: 'Payment Date', minWidth: 140 },
    ];

    const rows = payments.map((payment) => ({
        id: payment.uuid,
        type: payment.type
            ? payment.type.charAt(0).toUpperCase() + payment.type.slice(1).toLowerCase()
            : '—',
        plot: `Plot ${payment.plot?.plotNo || '—'}`,
        amount: `${currencyCode} ${Number(payment.amount || 0).toLocaleString()}`,
        status: (
            <Chip
                label={payment.status}
                color={payment.status === 'PAID' ? 'success' : 'default'}
                size="small"
            />
        ),
        date: payment.createdAt ? dayjs(payment.createdAt).format('MMM DD, YYYY') : '—',
    }));

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Payments</Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateRangePicker
                                slots={{ field: SingleInputDateRangeField }}
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="MMM DD, YYYY"
                                label="Payment Date Range"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                    },
                                    shortcuts: {
                                        items: [
                                            { label: 'Today', getValue: () => [dayjs(), dayjs()] },
                                            { label: 'Last 7 Days', getValue: () => [dayjs().subtract(7, 'day'), dayjs()] },
                                            { label: 'This Month', getValue: () => [dayjs().startOf('month'), dayjs()] },
                                            { label: 'Reset', getValue: () => [null, null] },
                                        ],
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
                {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                {loading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : !rows.length && !error ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No payments found for this customer.
                    </Typography>
                ) : isMobile ? (
                    <Stack spacing={2}>
                        {rows.map((row) => (
                            <ListingCard key={row.id} row={row} columns={columns} />
                        ))}
                    </Stack>
                ) : (
                    <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 620 }}>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.id} sx={{ minWidth: column.minWidth }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow hover key={row.id}>
                                        {columns.map((column) => (
                                            <TableCell key={column.id}>{row[column.id]}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <TablePagination
                    component="div"
                    count={total}
                    rowsPerPage={20}
                    page={page}
                    onPageChange={(_event, nextPage) => setPage(nextPage)}
                    rowsPerPageOptions={[]}
                />
            </CardContent>
        </Card>
    );
}

function ViewCustomer() {
    const { uuid } = useParams<{ uuid: string }>();
    const adminContext: any = useContext(AdminContext);
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const projectUuid = adminContext.projectUuid || '';
    const [tab, setTab] = useState(0);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Customers', path: ROUTES.CUSTOMER.LIST },
            { name: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Customer' },
        ]);
    }, [customer]);

    useEffect(() => {
        if (!uuid || !projectUuid) {
            setError('Select a project and a valid customer to view this profile.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        GetCustomer(uuid, projectUuid)
            .then((response) => {
                if (!response.status || !response.data) {
                    setError(response.errorMessage || response.message || 'Customer not found.');
                    return;
                }
                setCustomer(response.data);
            })
            .catch(() => setError('Unable to load customer details. Please try again.'))
            .finally(() => setLoading(false));
    }, [uuid, projectUuid]);

    return (
        <>
            <PageTitle
                title={customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Customer'}
                backTo={ROUTES.CUSTOMER.LIST}
                btn={customer && hasPermission(PERMISSIONS.CUSTOMER.UPDATE) ? {
                    label: 'Edit Customer',
                    to: ROUTES.CUSTOMER.EDIT(customer.uuid),
                    show: true,
                } : undefined}
            />
            {loading ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : customer ? (
                <>
                    <Card>
                        <Tabs
                            value={tab}
                            onChange={(_event: SyntheticEvent, value: number) => setTab(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="Customer profile sections"
                        >
                            <Tab label="Details" />
                            <Tab label="Tokens" />
                            <Tab label="Bookings" />
                            <Tab label="Payments" />
                        </Tabs>
                    </Card>
                    <TabPanel active={tab === 0}><CustomerDetails customer={customer} /></TabPanel>
                    <TabPanel active={tab === 1}><CustomerTokens customer={customer} /></TabPanel>
                    <TabPanel active={tab === 2}><CustomerBookings customer={customer} /></TabPanel>
                    <TabPanel active={tab === 3}>
                        <CustomerPayments customer={customer} />
                    </TabPanel>
                </>
            ) : null}
        </>
    );
}

export default ViewCustomer;
