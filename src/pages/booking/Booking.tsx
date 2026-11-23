import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton, Chip,
    useTheme, useMediaQuery,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetBookings } from '../../services/booking.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Booking() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';

    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ page: 1, perPage: constants.PER_PAGE, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);

    const btn = {
        to: ROUTES.BOOKING.CREATE,
        label: 'Add Booking',
        show: hasPermission(PERMISSIONS.BOOKING.CREATE),
    };

    const columns = [
        { id: 'plot',        label: 'Plot',         minWidth: 120 },
        { id: 'customer',    label: 'Customer',     minWidth: 160 },
        { id: 'plotPrice',   label: 'Plot Price',   minWidth: 130 },
        { id: 'tenure',      label: 'Tenure',       minWidth: 110 },
        { id: 'monthly',     label: 'Monthly',      minWidth: 130 },
        { id: 'status',      label: 'Status',       minWidth: 110 },
        { id: 'actions',     label: 'Actions',      minWidth: 100 },
    ];

    const fmt = (val: string | number) => `${currencyCode} ${Number(val || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        if (!adminContext.projectUuid) {
            setRows([]);
            setPaging({ page: 1, perPage: constants.PER_PAGE, total: 0, totalPages: 0 });
            setLoading(false);
            return;
        }
        GetBookings(
            { page: page + 1, perPage: constants.PER_PAGE },
            { projectUuid: adminContext.projectUuid },
        ).then((response) => {
            const list = response.data?.list || [];
            setRows(list.map((e: any) => ({
                id: e.uuid,
                plot: `Plot ${e.plot?.plotNo || '—'}`,
                customer: `${e.customer?.firstName || ''} ${e.customer?.lastName || ''}`.trim() || '—',
                plotPrice: fmt(e.plotPrice),
                tenure: `${e.tenureMonths} months`,
                monthly: fmt(e.monthlyInstallment),
                status: (
                    <Chip
                        label={e.status}
                        color={e.status === 'active' ? 'success' : e.status === 'completed' ? 'primary' : 'default'}
                        size="small"
                    />
                ),
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.BOOKING.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.BOOKING.EDIT(e.uuid)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            })));
            setPaging(response.data?.pagination || {
                page: page + 1,
                perPage: constants.PER_PAGE,
                total: 0,
                totalPages: 0,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Bookings' }]);
    }, []);

    useEffect(() => { fetchRows(); }, [page, adminContext.projectUuid]);

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
                            rowsPerPage={paging.perPage}
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
