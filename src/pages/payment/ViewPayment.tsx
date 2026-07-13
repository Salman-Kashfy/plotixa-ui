import { Table, TableCell, TableContainer, TableRow, TableBody, Box, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { CUSTOMER_TABS, ORDER_TYPE, ORDER_TYPE_NAME, PAYMENT_METHOD, PAYMENT_STATUS, ROUTES } from '../../utils/constants';
import { floor, round, toInteger } from 'lodash';
import dayjs from 'dayjs';
import { NavLink } from 'react-router-dom';
import Link from '@mui/material/Link';

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

function ViewPayment({ payment }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [name, setName] = useState('');
    const [nameLink, setNameLink] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);

    const statusColor = (status) => {
        switch (status) {
            case PAYMENT_STATUS.SUCCESS:
                return 'success';
            case PAYMENT_STATUS.PENDING:
            case PAYMENT_STATUS.REFUNDED:
            case PAYMENT_STATUS.PENDING_PAYMENT:
                return 'warning';
            case PAYMENT_STATUS.FAILURE:
                return 'error';
            default:
                return 'default';
        }
    };

    useEffect(() => {
        if (payment.orderType === ORDER_TYPE.PRIVATE_COACH) {
            setName(payment.orderPrivateCoach.name);
            setNameLink(ROUTES.SERVICE.VIEW(payment.orderPrivateCoach.sessionContract.serviceId));
            setGrandTotal(payment.orderPrivateCoach.total);
        } else if (payment.orderType === ORDER_TYPE.GYM_CLASS) {
            setName(payment.orderGymClass.name);
            setNameLink(ROUTES.CLASS_SCHEDULE.VIEW(payment.orderGymClass.scheduleGroupId));
            setGrandTotal(payment.amount);
        } else if ([ORDER_TYPE.MEMBERSHIP, ORDER_TYPE.CANCEL_MEMBERSHIP].includes(payment.orderType)) {
            setName(payment.membership.name);
            setNameLink(ROUTES.MEMBERSHIP_PLAN.VIEW(payment.membership.membershipPlanId));
            setGrandTotal(payment.amount);
        }
    }, [payment]);

    const taxLabel = `Tax (${
        floor(payment.taxRate, 2) % 1 === 0 ? toInteger(payment.taxRate) : round(payment.taxRate, 2)
    }%)`;

    const rows = (
        <>
            <DetailRow label="Invoice No." isMobile={isMobile}>
                {payment.invoiceNo}
            </DetailRow>
            <DetailRow label="Order Type" isMobile={isMobile}>
                {ORDER_TYPE_NAME[payment.orderType]}
            </DetailRow>
            <DetailRow label="Name" isMobile={isMobile}>
                <Link component={NavLink} to={nameLink} underline="none">
                    {name}
                </Link>
            </DetailRow>
            <DetailRow label="Customer" isMobile={isMobile}>
                <Link
                    component={NavLink}
                    to={ROUTES.CUSTOMER.TAB(payment.customer.id, CUSTOMER_TABS.DETAILS)}
                    underline="none"
                >
                    {payment.customer.fullName}
                </Link>
            </DetailRow>
            <DetailRow label="Subtotal" isMobile={isMobile}>
                {payment.currencySymbol + payment.subtotal}
            </DetailRow>
            <DetailRow label={taxLabel} isMobile={isMobile}>
                {payment.currencySymbol + payment.totalTax}
            </DetailRow>
            <DetailRow label="Discount" isMobile={isMobile}>
                {payment.currencySymbol + payment.discountedAmount}
            </DetailRow>
            <DetailRow label="Grand Total" isMobile={isMobile}>
                {payment.currencySymbol + grandTotal}
            </DetailRow>
            {payment.isSplitPayment ? (
                <>
                    <DetailRow label="Total Paid" isMobile={isMobile}>
                        {payment.currencySymbol + payment.amount}
                    </DetailRow>
                    <DetailRow label="Total Dues" isMobile={isMobile}>
                        {payment.currencySymbol + payment.pendingAmount}
                    </DetailRow>
                </>
            ) : null}
            <DetailRow label="Payment Status" isMobile={isMobile}>
                <Chip label={payment.paymentStatus} color={statusColor(payment.paymentStatus)} />
            </DetailRow>
            <DetailRow label="Payment Mode" isMobile={isMobile}>
                {PAYMENT_METHOD[payment.paymentMethod.paymentScheme]}
            </DetailRow>
            <DetailRow label="Payment Time" isMobile={isMobile}>
                {dayjs(payment.createdAt).format('MMM DD, YYYY hh:mm A')}
            </DetailRow>
            <DetailRow label="Placed By" isMobile={isMobile}>
                <Link component={NavLink} to={ROUTES.ADMIN.VIEW(payment.createdBy.id)} underline="none">
                    {payment.createdBy.fullName}
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

export default ViewPayment;
