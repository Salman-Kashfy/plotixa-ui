import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton,
    useTheme, useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import dayjs, { Dayjs } from 'dayjs';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetExpenses, DeleteExpense } from '../../services/expense.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';
import AppDialog from '../../components/AppDialog';

function Expense() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ page: 1, perPage: constants.PER_PAGE, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([dayjs(), dayjs()]);
    const [deleteTarget, setDeleteTarget] = useState<{ uuid: string; expenseType: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const btn = {
        to: ROUTES.EXPENSE.CREATE,
        label: 'Add Expense',
        show: hasPermission(PERMISSIONS.EXPENSE.UPSERT),
    };

    const columns = [
        { id: 'expenseType', label: 'Expense Type', minWidth: 200 },
        { id: 'amount',      label: 'Amount',        minWidth: 150 },
        { id: 'date',        label: 'Date',          minWidth: 150 },
        { id: 'actions',     label: 'Actions',        minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleDateRangeChange = (values: DateRange<Dayjs>) => {
         let start = values[0], end = values[1]
        if(start && end){
            start = dayjs(values[0])
            end = dayjs(values[1])
            setDateRange([start, end])
        }else if(!start && !end){
            setDateRange([null, null])
        }
        setPage(0);
    };

    const handleDelete = (uuid: string) => {
        setDeleting(true);
        DeleteExpense(uuid, adminContext.projectUuid).then((res) => {
            setDeleting(false);
            if (res.status) {
                setDeleteTarget(null);
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Expense deleted.');
                toastContext.setToast(true);
                fetchRows();
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(res.message || 'Something went wrong.');
                toastContext.setToast(true);
            }
        }).catch(() => setDeleting(false));
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: any = { projectUuid: adminContext.projectUuid };
        if (dateRange[0] && dateRange[1]) {
            params.startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
            params.endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
        }
        GetExpenses({ page: page + 1 }, params).then((response: any) => {
            const list = response.list || [];
            const nextRows = list.map((e: any) => ({
                id: e.uuid,
                expenseType: e.expenseType?.name || '—',
                amount: `${currencyCode ? `${currencyCode} ` : ''}${Number(e.amount).toLocaleString()}`,
                date: e.date ? dayjs(e.date).format('MMM DD, YYYY') : '—',
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.EXPENSE.UPSERT) && (
                            <IconButton component={NavLink} to={ROUTES.EXPENSE.EDIT(e.uuid)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.EXPENSE.DELETE) && (
                            <IconButton color="error" size="small" onClick={() => setDeleteTarget({ uuid: e.uuid, expenseType: e.expenseType?.name || 'this expense' })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            }));
            setRows(nextRows);
            setPaging(response.pagination || { page: 1, perPage: constants.PER_PAGE, total: 0, totalPages: 0 });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Expenses' }]);
    }, []);

    useEffect(() => {
        fetchRows();
    }, [page, dateRange]);

    return (
        <>
            <PageTitle title="Expenses" btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    slots={{ field: SingleInputDateRangeField }}
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    format="MMM DD, YYYY"
                                    label="Date Range"
                                    slotProps={{
                                        textField: {
                                            // variant: 'standard',
                                            sx: { width: '100%', backgroundColor: 'background.paper' },
                                            size: 'small',
                                        },
                                        shortcuts: {
                                            items: [
                                                { label: 'Today', getValue: () => [dayjs(), dayjs()] },
                                                { label: 'This Week', getValue: () => [dayjs().startOf('week'), dayjs().endOf('week')] },
                                                { label: 'Last 7 Days', getValue: () => [dayjs().subtract(7, 'day'), dayjs()] },
                                                { label: 'This Month', getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
                                                { label: 'Reset', getValue: () => [null, null] },
                                            ],
                                        },
                                    }}
                                />
                            </LocalizationProvider>
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
                                        No expenses found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="expenses table" sx={{ minWidth: 500 }}>
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

            <AppDialog
                open={!!deleteTarget}
                handleDialogClose={() => setDeleteTarget(null)}
                title="Delete Expense"
                body={`Are you sure you want to delete "${deleteTarget?.expenseType}"?`}
                dialogBtnLoading={deleting}
                dialogBtnLabel="Delete"
                onSubmit={() => deleteTarget && handleDelete(deleteTarget.uuid)}
            />
        </>
    );
}

export default Expense;
