import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton,
    useTheme, useMediaQuery,
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetCustomers, DeleteCustomer } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';
import SearchForm from '../../components/SearchForm';
import Grid from '@mui/material/Grid2';

function Customer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');

    const btn = {
        to: ROUTES.CUSTOMER.CREATE,
        label: 'Add Customer',
        show: hasPermission(PERMISSIONS.CUSTOMER.CREATE),
    };

    const columns = [
        { id: 'name',        label: 'Name',         minWidth: 180 },
        { id: 'phone',       label: 'Phone',        minWidth: 160 },
        { id: 'actions',     label: 'Actions',      minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(0);
    };

    const handleDelete = (id: string) => {
        DeleteCustomer(id).then((res) => {
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer deleted.');
                toastContext.setToast(true);
                fetchRows();
            }
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        GetCustomers({ page: page + 1 }, { searchText }).then((response: any) => {
            const list = response.data || [];
            setRows(list.map((e: any) => ({
                id: e.id,
                name: e.name,
                phone: `${e.phoneCode} ${e.phoneNumber}`,
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.CUSTOMER.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.CUSTOMER.EDIT(e.id)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.CUSTOMER.DELETE) && (
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
        breadcrumbContext.setBreadcrumb([{ name: 'Customers' }]);
    }, []);

    useEffect(() => { fetchRows(); }, [page, searchText]);

    return (
        <>
            <PageTitle title="Customers" btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Customers" />
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

export default Customer;
