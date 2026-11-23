import { useEffect, useState } from 'react';
import {
    Alert, Box, Chip, CircularProgress, Dialog, DialogContent,
    DialogTitle, IconButton, TablePagination, Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { GetOverdueBookings, type OverdueBooking } from '../../services/booking.service';
import { ROUTES } from '../../utils/constants';

type Props = {
    open: boolean;
    onClose: () => void;
    projectUuid: string;
    currencyCode: string;
};

const columns = [
    { label: 'Customer', flex: 1.4 },
    { label: 'Plot', flex: 0.7 },
    { label: 'Monthly', flex: 1 },
    { label: 'Overdue', flex: 0.8 },
    { label: 'Status', flex: 0.8 },
    { label: '', flex: 0.4 },
];

function OverdueBookingsModal({ open, onClose, projectUuid, currencyCode }: Props) {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [rows, setRows] = useState<OverdueBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !projectUuid) return;
        let active = true;
        setLoading(true);
        setError('');
        GetOverdueBookings({ page: page + 1, perPage }, projectUuid)
            .then((response) => {
                if (!active) return;
                setRows(response.list);
                setTotal(response.pagination.total);
            })
            .catch((err: any) => {
                if (active) setError(err?.message || 'Unable to load overdue bookings.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [open, page, perPage, projectUuid]);

    const formatAmount = (value: string) =>
        `${currencyCode} ${Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const openBooking = (booking: OverdueBooking) => {
        onClose();
        navigate(
            `${ROUTES.CUSTOMER.VIEW(booking.customer.uuid)}?tab=bookings&bookingUuid=${encodeURIComponent(booking.uuid)}`,
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Overdue Installments
                <IconButton size="small" onClick={onClose} aria-label="Close overdue installments">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {error ? <Alert severity="error" sx={{ m: 2 }}>{error}</Alert> : null}
                {loading ? (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : !rows.length ? (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No overdue bookings found.</Typography>
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                minHeight: 48,
                                px: 2,
                                gap: 1,
                                bgcolor: 'action.hover',
                                borderBottom: 1,
                                borderColor: 'divider',
                            }}
                        >
                            {columns.map((column, index) => (
                                <Typography
                                    key={column.label || index}
                                    variant="caption"
                                    fontWeight={700}
                                    sx={{ flex: column.flex, minWidth: 0 }}
                                >
                                    {column.label}
                                </Typography>
                            ))}
                        </Box>
                        <Box sx={{ height: 320, overflowY: 'auto', overflowX: 'auto' }}>
                            {rows.map((booking) => (
                                <Box
                                    key={booking.uuid}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        minHeight: 64,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        px: 2,
                                        gap: 1,
                                    }}
                                >
                                    {columns.map((column, columnIndex) => (
                                        <Box
                                            key={column.label || columnIndex}
                                            sx={{ flex: column.flex, minWidth: 90, overflow: 'hidden' }}
                                        >
                                            {columnIndex === 0 ? (
                                                <Typography noWrap>
                                                    {booking.customer.firstName} {booking.customer.lastName}
                                                </Typography>
                                            ) : columnIndex === 1 ? (
                                                <Typography noWrap>Plot {booking.plot.plotNo}</Typography>
                                            ) : columnIndex === 2 ? (
                                                <Typography noWrap>{formatAmount(booking.monthlyInstallment)}</Typography>
                                            ) : columnIndex === 3 ? (
                                                <Chip label={`${booking.overdueInstallmentsCount}`} color="error" size="small" />
                                            ) : columnIndex === 4 ? (
                                                <Chip
                                                    label={booking.status}
                                                    color={booking.status === 'active' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            ) : (
                                                <Tooltip title="View booking">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => openBooking(booking)}
                                                        aria-label="View overdue booking"
                                                    >
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={perPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    onPageChange={(_event, nextPage) => setPage(nextPage)}
                    onRowsPerPageChange={(event) => {
                        setPerPage(Number(event.target.value));
                        setPage(0);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

export default OverdueBookingsModal;
