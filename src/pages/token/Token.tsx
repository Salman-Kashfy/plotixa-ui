import { useEffect, useState, useContext, useCallback } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton, Chip, FormControl, InputLabel, Select, MenuItem, TextField,
    useTheme, useMediaQuery,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid2';
import { NavLink } from 'react-router-dom';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, constants, PERMISSIONS, TOKEN_STATUS, TOKEN_STATUS_COLOR } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetTokens, DeleteToken } from '../../services/token.service';
import { GetCustomers } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Token() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';

    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);

    // Filters
    const [status, setStatus] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerInput, setCustomerInput] = useState('');

    const btn = {
        to: ROUTES.TOKEN.CREATE,
        label: 'Add Token',
        show: hasPermission(PERMISSIONS.TOKEN.CREATE),
    };

    const columns = [
        { id: 'customer',  label: 'Customer',  minWidth: 160 },
        { id: 'phone',     label: 'Phone',      minWidth: 140 },
        { id: 'plot',      label: 'Plot',       minWidth: 120 },
        { id: 'amount',    label: 'Amount',     minWidth: 120 },
        { id: 'status',    label: 'Status',     minWidth: 110 },
        { id: 'actions',   label: 'Actions',    minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const searchCustomers = useCallback((search: string) => {
        if (!search.trim()) { setCustomerOptions([]); return; }
        setCustomerLoading(true);
        GetCustomers({ page: 1, limit: 20 }, { searchText: search }).then((res) => {
            setCustomerOptions(res.data || []);
            setCustomerLoading(false);
        }).catch(() => setCustomerLoading(false));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchCustomers(customerInput), 400);
        return () => clearTimeout(timer);
    }, [customerInput, searchCustomers]);

    const handleDelete = (id: string) => {
        DeleteToken(id).then((res) => {
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Token deleted.');
                toastContext.setToast(true);
                fetchRows();
            }
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: any = {};
        if (status) params.status = status;
        if (selectedCustomer) params.customerId = selectedCustomer.id;
        GetTokens({ page: page + 1 }, params).then((response: any) => {
            const list = response.data || [];
            setRows(list.map((e: any) => ({
                id: e.id,
                customer: e.customer?.name || '—',
                phone: e.customer ? `${e.customer.phoneCode}${e.customer.phoneNumber}` : '—',
                plot: e.plot ? `${e.plot.block?.name}-${e.plot.plotNo}` : '—',
                amount: `${currencyCode} ${(e.amount || 0).toLocaleString()}`,
                status: e.status ? (
                    <Chip
                        label={e.status}
                        color={TOKEN_STATUS_COLOR[e.status as TOKEN_STATUS] || 'default'}
                        size="small"
                    />
                ) : '—',
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.TOKEN.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.TOKEN.EDIT(e.id)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.TOKEN.DELETE) && (
                            <IconButton color="error" size="small" onClick={() => handleDelete(e.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            })));
            setPaging(response.paging || { totalPages: 0, totalResultCount: 0 });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Tokens' }]);
    }, []);

    useEffect(() => { fetchRows(); }, [page, status, selectedCustomer]);

    return (
        <>
            <PageTitle title="Tokens" btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        {/* Customer filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Autocomplete
                                options={customerOptions}
                                getOptionLabel={(opt) => opt.name ? `${opt.name} (${opt.phoneCode}${opt.phoneNumber})` : ''}
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                value={selectedCustomer}
                                loading={customerLoading}
                                filterOptions={(x) => x}
                                noOptionsText={customerInput ? 'No customers found' : 'Type to search'}
                                onInputChange={(_e, value) => setCustomerInput(value)}
                                onChange={(_e, value) => { setSelectedCustomer(value); setPage(0); }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Customer"
                                        variant="standard"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {customerLoading ? <CircularProgress size={16} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        {/* Status filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
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
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="tokens table" sx={{ minWidth: 550 }}>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((col) => (
                                                <TableCell key={col.id} style={{ minWidth: col.minWidth }}>
                                                    {col.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow hover key={row.id} sx={{ opacity: loading ? 0.2 : 1 }}>
                                                {columns.map((col) => (
                                                    <TableCell key={col.id}>{row[col.id]}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                        <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length} />
                                        <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length} />
                                    </TableBody>
                                    <TableFooter>
                                        {loading && !rows.length ? (
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
        </>
    );
}

export default Token;
