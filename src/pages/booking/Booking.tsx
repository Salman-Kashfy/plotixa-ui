import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton,
    useTheme, useMediaQuery,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, constants, PERMISSIONS, TENURE_OPTIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetBookings, DeleteBooking } from '../../services/booking.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Booking() {
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

    const btn = {
        to: ROUTES.BOOKING.CREATE,
        label: 'Add Booking',
        show: hasPermission(PERMISSIONS.BOOKING.CREATE),
    };

    const columns = [
        { id: 'plot',        label: 'Plot',         minWidth: 120 },
        { id: 'plotPrice',   label: 'Plot Price',   minWidth: 130 },
        { id: 'tenure',      label: 'Tenure',       minWidth: 110 },
        { id: 'token',       label: 'Token',        minWidth: 120 },
        { id: 'booking',     label: 'Booking',      minWidth: 120 },
        { id: 'actions',     label: 'Actions',      minWidth: 100 },
    ];

    const fmt = (val: number) => `${currencyCode} ${(val || 0).toLocaleString()}`;

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const handleDelete = (id: string) => {
        DeleteBooking(id).then((res) => {
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Booking deleted.');
                toastContext.setToast(true);
                fetchRows();
            }
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        GetBookings({ page: page + 1 }).then((response: any) => {
            const list = response.data || [];
            setRows(list.map((e: any) => ({
                id: e.id,
                plot: e.plot ? `${e.plot.block?.name}-${e.plot.plotNo}` : '—',
                plotPrice: e.plot?.price ? fmt(e.plot.price) : '—',
                tenure: TENURE_OPTIONS.find((t) => t.value === e.tenure)?.label || `${e.tenure} mo`,
                token: e.tokenAmount ? fmt(e.tokenAmount) : '—',
                booking: e.bookingAmount ? fmt(e.bookingAmount) : '—',
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.BOOKING.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.BOOKING.EDIT(e.id)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.BOOKING.DELETE) && (
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
        breadcrumbContext.setBreadcrumb([{ name: 'Bookings' }]);
    }, []);

    useEffect(() => { fetchRows(); }, [page]);

    return (
        <>
            <PageTitle title="Bookings" btn={btn} />
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
                                        No bookings found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="bookings table" sx={{ minWidth: 650 }}>
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

export default Booking;
