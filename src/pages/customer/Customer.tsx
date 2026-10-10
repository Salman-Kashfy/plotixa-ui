import { useEffect, useState, useContext, type ChangeEvent } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton, TextField,
    useTheme, useMediaQuery, Alert,
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetCustomers, DeleteCustomer, type Customer } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Customer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const projectUuid: string = adminContext.projectUuid || '';
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [loadError, setLoadError] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');

    const projectQuery = projectUuid ? `?projectUuid=${encodeURIComponent(projectUuid)}` : '';

    const btn = {
        to: `${ROUTES.CUSTOMER.CREATE}${projectQuery}`,
        label: 'Add Customer',
        show: hasPermission(PERMISSIONS.CUSTOMER.CREATE),
    };

    const columns = [
        { id: 'name',        label: 'Name',         minWidth: 180 },
        { id: 'phone',       label: 'Phone',        minWidth: 160 },
        { id: 'actions',     label: 'Actions',      minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPhoneFilter(event.target.value.replace(/\D/g, ''));
        setPage(0);
    };

    const handleDelete = (uuid: string) => {
        DeleteCustomer(uuid, projectUuid).then((res) => {
            if (res.status && res.data === true) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer deleted.');
                toastContext.setToast(true);
                fetchRows();
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(
                    res.errorMessage || res.message || res.errors?.[0]?.message || 'Unable to delete customer.',
                );
                toastContext.setToast(true);
            }
        }).catch((error) => {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(
                error?.response?.data?.errorMessage
                || error?.response?.data?.message
                || error?.response?.data?.errors?.[0]?.message
                || error?.message
                || 'Unable to delete customer. Please try again.',
            );
            toastContext.setToast(true);
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        setLoadError('');
        if (!projectUuid) {
            setRows([]);
            setPaging({ total: 0 });
            setLoadError('Select a project to view its customers.');
            setLoading(false);
            return;
        }
        GetCustomers(
            { page: page + 1, perPage: constants.PER_PAGE },
            projectUuid,
            { phone: phoneFilter },
        ).then((response) => {
            if (!response.status || !response.data) {
                setRows([]);
                setPaging({ total: 0 });
                setLoadError(response.errorMessage || response.message || 'Unable to load customers.');
                setLoading(false);
                return;
            }
            setRows(response.data.list.map((e: Customer) => ({
                id: e.uuid,
                name: `${e.firstName} ${e.lastName}`.trim(),
                phone: `${e.phoneCode} ${e.phoneNumber}`,
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.CUSTOMER.UPDATE) && (
                            <IconButton component={NavLink} to={`${ROUTES.CUSTOMER.EDIT(e.uuid)}${projectQuery}`} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.CUSTOMER.DELETE) && (
                            <IconButton color="error" size="small" onClick={() => handleDelete(e.uuid)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            })));
            setPaging({ total: response.data.pagination.total });
            setLoading(false);
        }).catch(() => {
            setRows([]);
            setPaging({ total: 0 });
            setLoadError('Unable to load customers. Please try again.');
            setLoading(false);
        });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Customers' }]);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(fetchRows, phoneFilter ? 400 : 0);
        return () => clearTimeout(timeout);
    }, [page, projectUuid, phoneFilter]);

    return (
        <>
            <PageTitle title="Customers" btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                label="Search by phone"
                                value={phoneFilter}
                                onChange={handlePhoneChange}
                                variant="standard"
                                type="text"
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box>
                        {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
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
                                        No customers found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="customers table" sx={{ minWidth: 500 }}>
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
                                        {loading ? (
                                            <TableSpinner loading colSpan={columns.length} rowCount={rows.length} />
                                        ) : null}
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            component="div"
                            count={paging.total}
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

export default Customer;
