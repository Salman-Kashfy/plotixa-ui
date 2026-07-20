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
import { GetExpenses, DeleteExpense } from '../../services/expense.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Expense() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);

    const btn = {
        to: ROUTES.EXPENSE.CREATE,
        label: 'Add Expense',
        show: hasPermission(PERMISSIONS.EXPENSE.CREATE),
    };

    const columns = [
        { id: 'expenseType', label: 'Expense Type', minWidth: 200 },
        { id: 'amount',      label: 'Amount',        minWidth: 150 },
        { id: 'createdAt',   label: 'Date',           minWidth: 150 },
        { id: 'actions',     label: 'Actions',        minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleDelete = (id: string) => {
        DeleteExpense(id).then((res) => {
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Expense deleted.');
                toastContext.setToast(true);
                fetchRows();
            }
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        GetExpenses({ page: page + 1 }).then((response: any) => {
            const list = response.data || [];
            const nextRows = list.map((e: any) => ({
                id: e.id,
                expenseType: e.expenseType?.name || '—',
                amount: e.amount?.toLocaleString(),
                createdAt: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—',
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.EXPENSE.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.EXPENSE.EDIT(e.id)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.EXPENSE.DELETE) && (
                            <IconButton color="error" size="small" onClick={() => handleDelete(e.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            }));
            setRows(nextRows);
            setPaging(response.paging || { totalPages: 0, totalResultCount: 0 });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Expenses' }]);
    }, []);

    useEffect(() => {
        fetchRows();
    }, [page]);

    return (
        <>
            <PageTitle title="Expenses" btn={btn} />
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
                                        No expenses found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="expenses table" sx={{ minWidth: 600 }}>
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

export default Expense;
