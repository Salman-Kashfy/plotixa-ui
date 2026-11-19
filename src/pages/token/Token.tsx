import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    Chip, FormControl, InputLabel, Select, MenuItem,
    useTheme, useMediaQuery, IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import UndoIcon from '@mui/icons-material/Undo';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { constants, PERMISSIONS, TOKEN_STATUS, TOKEN_STATUS_COLOR } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetTokens, RefundToken, getTokenExpiresInDays, type TokenStatus } from '../../services/token.service';
import PageTitle from '../../components/PageTitle';
import AppDialog from '../../components/AppDialog';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Token() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const projectUuid = adminContext.projectUuid || '';
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';

    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [refundTarget, setRefundTarget] = useState<any | null>(null);
    const [refunding, setRefunding] = useState(false);

    // Filters
    const [status, setStatus] = useState<TokenStatus | ''>('');

    const columns = [
        { id: 'customer',  label: 'Customer',  minWidth: 160 },
        { id: 'plot',      label: 'Plot',       minWidth: 120 },
        { id: 'category',  label: 'Category',   minWidth: 120 },
        { id: 'amount',    label: 'Amount',     minWidth: 120 },
        { id: 'status',    label: 'Status',     minWidth: 110 },
        { id: 'expiresIn', label: 'Expires In',  minWidth: 100 },
        { id: 'actions',   label: 'Actions',     minWidth: 80 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        if (!projectUuid) {
            setRows([]);
            setPaging({ totalPages: 0, totalResultCount: 0 });
            setLoading(false);
            return;
        }
        const params: { status?: TokenStatus } = {};
        if (status) params.status = status;
        GetTokens({ page: page + 1, perPage: constants.PER_PAGE }, projectUuid, params).then((response: any) => {
            const list = response.data?.list || [];
            setRows(list.map((e: any) => ({
                id: e.uuid || e.id,
                customer: `${e.customer?.firstName || ''} ${e.customer?.lastName || ''}`.trim() || '—',
                plot: e.plotName || (e.plot?.block?.name
                    ? `${e.plot.block.name} - ${e.plot.plotNo}`
                    : `Plot ${e.plot?.plotNo || '—'}`),
                category: e.plot?.category?.name || '—',
                amount: `${currencyCode} ${Number(e.amount || 0).toLocaleString()}`,
                expiresIn: `${getTokenExpiresInDays(e.status, e.expiredAt)} days`,
                status: e.status ? (
                    <Chip
                        label={e.status}
                        color={TOKEN_STATUS_COLOR[e.status as TOKEN_STATUS] || 'default'}
                        size="small"
                    />
                ) : '—',
                actions: e.status !== TOKEN_STATUS.REFUNDED && hasPermission(PERMISSIONS.TOKEN.UPDATE) ? (
                    <IconButton
                        onClick={() => setRefundTarget(e)}
                        color="warning"
                        size="small"
                        aria-label={`Refund token for ${e.customer?.firstName || 'customer'}`}
                    >
                        <UndoIcon fontSize="small" />
                    </IconButton>
                ) : null,
            })));
            setPaging({
                totalPages: response.data?.pagination?.totalPages || 0,
                totalResultCount: response.data?.pagination?.total || 0,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Tokens' }]);
    }, []);

    useEffect(() => { fetchRows(); }, [page, status, projectUuid]);

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
                fetchRows();
            })
            .catch(() => {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage('Unable to refund token. Please try again.');
                toastContext.setToast(true);
            })
            .finally(() => setRefunding(false));
    };

    return (
        <>
            <PageTitle title="Tokens" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={status}
                                    label="Status"
                                    onChange={(event) => {
                                        setStatus(event.target.value as TokenStatus | '');
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {Object.values(TOKEN_STATUS).map((s) => (
                                        <MenuItem key={s} value={s}>
                                            <Chip label={s} color={TOKEN_STATUS_COLOR[s]} size="small" />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{ p: 3 }}>
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
                                        No tokens found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="tokens table" sx={{ minWidth: 700 }}>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((col) => (
                                                <TableCell key={col.id} sx={{ minWidth: col.minWidth, whiteSpace: 'nowrap' }}>
                                                    {col.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow hover key={row.id} sx={{ opacity: loading ? 0.2 : 1 }}>
                                                {columns.map((col) => (
                                                    <TableCell key={col.id} sx={{ whiteSpace: 'nowrap' }}>
                                                        {row[col.id]}
                                                    </TableCell>
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
                </CardContent>
            </Card>
            <AppDialog
                open={Boolean(refundTarget)}
                handleDialogClose={() => !refunding && setRefundTarget(null)}
                title="Refund Token"
                body={`Refund ${currencyCode} ${Number(refundTarget?.amount || 0).toLocaleString()} for this token?`}
                dialogBtnLoading={refunding}
                dialogBtnLabel="Refund"
                onSubmit={refundToken}
            />
        </>
    );
}

export default Token;
