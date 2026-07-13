import {
    Box,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Link from '@mui/material/Link';
import { NavLink } from 'react-router-dom';
import { CHAMPION_TYPE, MEMBERSHIP_STATUS, ROUTES } from '../../utils/constants';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';

function DetailRow({ label, children, isMobile }) {
    if (isMobile) {
        return (
            <Box sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                    {label}
                </Typography>
                <Box sx={{ typography: 'body2' }}>{children}</Box>
            </Box>
        );
    }

    return (
        <TableRow>
            <TableCell sx={{ color: 'primary.main', fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                {label}
            </TableCell>
            <TableCell sx={{ wordBreak: 'break-word' }}>{children}</TableCell>
        </TableRow>
    );
}

function ViewMembership({ record, customer, statusColor }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const rows = (
        <>
            <DetailRow label="Name" isMobile={isMobile}>
                <Link
                    component={NavLink}
                    to={ROUTES.MEMBERSHIP_PLAN.VIEW(record.membershipPlanId)}
                    underline="none"
                >
                    {record.membershipPlan.name}
                </Link>
            </DetailRow>
            <DetailRow label="Joining Date" isMobile={isMobile}>
                {dayjs(record.startDate).format('MMM DD, YYYY hh:mm A')}
            </DetailRow>
            <DetailRow label="Valid Till" isMobile={isMobile}>
                {record.endDate ? dayjs(record.endDate).format('MMM DD, YYYY hh:mm A') : '-'}
            </DetailRow>
            <DetailRow label="Status" isMobile={isMobile}>
                <Chip
                    label={
                        record.pendingAmount && record.status === MEMBERSHIP_STATUS.PENDING_PAYMENT
                            ? 'Partially Paid'
                            : MEMBERSHIP_STATUS[record.status]
                    }
                    color={statusColor(record.status)}
                />
            </DetailRow>
            <DetailRow label="Scope" isMobile={isMobile}>
                <Chip label={capitalize(record.championType) || 'Local'} />
            </DetailRow>
            {record.championType ? (
                <>
                    <DetailRow label="Recognition" isMobile={isMobile}>
                        {record.championType === CHAMPION_TYPE.DOMESTIC ? (
                            'All domestic branches'
                        ) : (
                            <>
                                {record.customGyms.map((gym, index) => (
                                    <Link
                                        key={gym.id}
                                        component={NavLink}
                                        to={ROUTES.GYM.VIEW(gym.id)}
                                        underline="none"
                                    >
                                        {gym.name}
                                        {index < record.customGyms.length - 1 ? ', ' : ''}
                                    </Link>
                                ))}
                            </>
                        )}
                    </DetailRow>
                    <DetailRow label="Source Gym" isMobile={isMobile}>
                        <Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline="none">
                            {record.gym.name}
                        </Link>
                    </DetailRow>
                </>
            ) : null}
            <DetailRow label="Payment Plan" isMobile={isMobile}>
                <Link
                    component={NavLink}
                    to={ROUTES.PAYMENT_PLAN.VIEW(record.paymentPlanId)}
                    underline="none"
                >
                    {record.paymentPlan.name}
                </Link>
            </DetailRow>
            <DetailRow label="Joining Fee" isMobile={isMobile}>
                {customer.country.currency.symbol + record.joiningFee}
            </DetailRow>
            <DetailRow label="Price" isMobile={isMobile}>
                {customer.country.currency.symbol + record.price}
            </DetailRow>
            <DetailRow label="Subtotal" isMobile={isMobile}>
                {customer.country.currency.symbol + record.subtotal}
            </DetailRow>
            <DetailRow
                label={`${customer.country.taxName} (${record.taxRate}%)`}
                isMobile={isMobile}
            >
                {customer.country.currency.symbol + record.totalTax}
            </DetailRow>
            <DetailRow label="Discount" isMobile={isMobile}>
                {record.discountedAmount
                    ? customer.country.currency.symbol + record.discountedAmount
                    : 0}
            </DetailRow>
            <DetailRow label="Total" isMobile={isMobile}>
                {customer.country.currency.symbol + record.total}
            </DetailRow>
            <DetailRow label="Sales" isMobile={isMobile}>
                {dayjs(record.createdAt).format('MMM DD, YYYY')} By{' '}
                <Link component={NavLink} to={ROUTES.ADMIN.VIEW(record.createdBy.id)} underline="none">
                    {record.createdBy.fullName}
                </Link>
            </DetailRow>
        </>
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            {isMobile ? (
                <Stack>{rows}</Stack>
            ) : (
                <TableContainer>
                    <Table>
                        <TableBody>{rows}</TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default ViewMembership;
