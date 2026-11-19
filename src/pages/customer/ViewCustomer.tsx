import { useContext, useEffect, useState, type SyntheticEvent } from 'react';
import {
    Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card,
    CardContent, Chip, CircularProgress, Divider, IconButton, Stack, Tab, Tabs,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { useParams } from 'react-router-dom';
import { AdminContext } from '../../hooks/AdminContext';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import PageTitle from '../../components/PageTitle';
import { GetCustomer, type Customer } from '../../services/customer.service';
import { GetBookings, GetBooking } from '../../services/booking.service';
import { GetTokens, UpsertToken } from '../../services/token.service';
import { hasPermission } from '../../utils/permissions';
import TokenForm from '../token/TokenForm';
import {
    PERMISSIONS, ROUTES, TENURE_OPTIONS, TOKEN_STATUS, TOKEN_STATUS_COLOR,
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

    const openEditDialog = (token: any) => {
        setEditingToken(token);
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
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Plot</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.uuid || token.id}>
                                        <TableCell>
                                            {token.plot?.block?.name
                                                ? `${token.plot.block.name}-${token.plot.plotNo}`
                                                : `Plot ${token.plot?.plotNo || '—'}`}
                                        </TableCell>
                                        <TableCell>
                                            {currencyCode} {Number(token.amount || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={token.status}
                                                color={TOKEN_STATUS_COLOR[token.status as TOKEN_STATUS] || 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {hasPermission(PERMISSIONS.TOKEN.UPDATE) ? (
                                                <IconButton
                                                    onClick={() => openEditDialog(token)}
                                                    color="warning"
                                                    size="small"
                                                    aria-label="Edit token"
                                                >
                                                    <ModeEditIcon fontSize="small" />
                                                </IconButton>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
            { page: 1, limit: 100 },
            { projectUuid, customerUuid: customer.uuid },
        ).then((response: any) => {
            if (!active) return;
            const list = response.data?.list || response.data || [];
            setBookings(list.filter((booking: any) =>
                !booking.customer
                || (booking.customer.uuid || booking.customer.id) === customer.uuid,
            ));
        }).catch(() => {
            if (active) setError('Unable to load customer bookings. Please try again.');
        }).finally(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, [customer.uuid, projectUuid]);

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
                                    {booking.plot?.block?.name
                                        ? `${booking.plot.block.name}-${booking.plot.plotNo}`
                                        : `Plot ${booking.plot?.plotNo || '—'}`}
                                </Typography>
                                <Typography color="text.secondary">
                                    {TENURE_OPTIONS.find((option) => option.value === booking.tenure)?.label
                                        || `${booking.tenure || 0} months`}
                                </Typography>
                                <Typography color="primary.main" fontWeight={600}>
                                    {currencyCode} {Number(booking.plot?.price || 0).toLocaleString()}
                                </Typography>
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
        </Stack>
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
                        <Card>
                            <CardContent sx={{ py: 5 }}>
                                <Typography color="text.secondary" textAlign="center">
                                    Customer payments will appear here.
                                </Typography>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </>
            ) : null}
        </>
    );
}

export default ViewCustomer;
