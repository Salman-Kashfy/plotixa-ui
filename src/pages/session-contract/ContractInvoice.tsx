import {
    Box,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableFooter,
    FormControl,
    InputLabel,
    MenuItem,
    FormHelperText,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { BillingTotal } from '../../services/payment.service';
import { DISCOUNT_TYPE, PAYMENT_METHOD, ORDER_TYPE, PAYMENT_OPTION } from '../../utils/constants';
import { isEmpty } from 'lodash';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import Select from '@mui/material/Select';
import FormInput from '../../components/FormInput';
import { decimalOnly } from '../../utils/validations';

function ContractInvoice({
    customerId,
    sessionContractId,
    billingLoading,
    setBillingLoading,
    loading,
    callback,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTION.FULL_PAYMENT);
    const [billing, setBilling] = useState({});
    const [grandTotal, setGrandTotal] = useState(0);
    const defaultValues = {
        paymentMethod: '',
        amount: 0,
        sessionContractId,
    };
    const { control, handleSubmit, watch, reset } = useForm({
        mode: 'onChange',
        defaultValues,
    });
    const paymentMethod = watch('paymentMethod');

    const initializeForm = (data) => {
        const _data = {};
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? data[key] || '' : data[key];
        }
        reset(_data);
    };

    useEffect(() => {
        setBillingLoading(true);
        BillingTotal({ orderType: ORDER_TYPE.PRIVATE_COACH, customerId, sessionContractId })
            .then((e) => {
                setBillingLoading(false);
                setGrandTotal(e.total);
                setBilling(e);
            })
            .catch(() => {
                setBillingLoading(false);
            });

        if (!isEmpty(sessionContractId) && !isEmpty(customerId)) {
            initializeForm({ customerId, sessionContractId });
        }
    }, [sessionContractId, customerId]);

    const onSubmit = async (data) => {
        const _data = {};
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if (!data[key]) continue;
                    break;
                case 'amount':
                    data[key] =
                        paymentOption === PAYMENT_OPTION.FULL_PAYMENT
                            ? parseFloat(billing.total)
                            : parseFloat(data[key]);
                    break;
                case 'paymentMethod':
                    data[key] = {
                        name: '',
                        paymentScheme: data[key],
                    };
                    break;
            }
            _data[key] = data[key];
        }
        callback(_data);
    };

    const billingSummary =
        !isEmpty(billing) ? (
            <>
                {billing.items.map((e, index) =>
                    isMobile ? (
                        <Box
                            key={e.name || index}
                            sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                {e.name}
                            </Typography>
                            <Stack spacing={0.5}>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Unit Price
                                    </Typography>
                                    <Typography variant="body2">{billing.currency + e.price}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Qty
                                    </Typography>
                                    <Typography variant="body2">{e.qty}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2" fontWeight={600}>
                                        Line Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {billing.currency + e.total}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    ) : (
                        <TableRow key={e.name || index}>
                            <TableCell>{e.name}</TableCell>
                            <TableCell>{billing.currency + e.price}</TableCell>
                            <TableCell>{e.qty}</TableCell>
                            <TableCell>{billing.currency + e.total}</TableCell>
                        </TableRow>
                    )
                )}
                {isMobile ? (
                    <Stack spacing={1} sx={{ pt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2" fontWeight="bold">
                                Subtotal
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {billing.currency + billing.subtotal}
                            </Typography>
                        </Stack>
                        {billing.discount ? (
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2">
                                    Discount{' '}
                                    {billing.discount.discountType === DISCOUNT_TYPE.PERCENTAGE
                                        ? `${billing.discount.percentage}%${
                                              billing.discount.isCapped ? ' - Capped' : ''
                                          }`
                                        : ''}
                                </Typography>
                                <Typography variant="body2">
                                    {billing.currency + billing.discount.discountAmount}
                                </Typography>
                            </Stack>
                        ) : null}
                        {billing.tax?.amount ? (
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2">
                                    {billing.tax.name} ({billing.tax.rate}%)
                                </Typography>
                                <Typography variant="body2">
                                    {billing.currency + billing.tax.amount}
                                </Typography>
                            </Stack>
                        ) : null}
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2" fontWeight="bold">
                                Grand Total
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {billing.currency + billing.invoiceAmount}
                            </Typography>
                        </Stack>
                        {billing.amountPaid ? (
                            <>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2">Total Paid</Typography>
                                    <Typography variant="body2">
                                        {billing.currency + billing.amountPaid}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2" fontWeight="bold">
                                        Dues Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {billing.currency + billing.total}
                                    </Typography>
                                </Stack>
                            </>
                        ) : null}
                    </Stack>
                ) : (
                    <>
                        <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                Subtotal
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {billing.currency + billing.subtotal}
                            </TableCell>
                        </TableRow>
                        {billing.discount ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    Discount{' '}
                                    {billing.discount.discountType === DISCOUNT_TYPE.PERCENTAGE
                                        ? `${billing.discount.percentage}%${
                                              billing.discount.isCapped ? ' - Capped' : ''
                                          }`
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {billing.currency + billing.discount.discountAmount}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {billing.tax?.amount ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    {billing.tax.name} ({billing.tax.rate}%)
                                </TableCell>
                                <TableCell>{billing.currency + billing.tax.amount}</TableCell>
                            </TableRow>
                        ) : null}
                        <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                Grand Total
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {billing.currency + billing.invoiceAmount}
                            </TableCell>
                        </TableRow>
                        {billing.amountPaid ? (
                            <>
                                <TableRow>
                                    <TableCell colSpan={3}>Total Paid</TableCell>
                                    <TableCell>{billing.currency + billing.amountPaid}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                        Dues Total
                                    </TableCell>
                                    <TableCell>{billing.currency + billing.total}</TableCell>
                                </TableRow>
                            </>
                        ) : null}
                    </>
                )}
            </>
        ) : null;

    const paymentControls = (
        <Stack
            spacing={2}
            sx={{
                mt: isMobile ? 2 : 0,
                pt: isMobile ? 2 : 0,
                borderTop: isMobile ? 1 : 0,
                borderColor: 'divider',
            }}
        >
            <Controller
                name="paymentMethod"
                control={control}
                rules={{
                    required: {
                        value: 'required',
                        message: 'Payment method is required',
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FormControl variant="standard" fullWidth error={!!error}>
                        <InputLabel>Payment method</InputLabel>
                        <Select
                            label="Payment method"
                            {...field}
                            value={field.value || ''}
                            error={!!error}
                        >
                            {Object.keys(PAYMENT_METHOD).map((key: string) => (
                                <MenuItem value={key} key={key}>
                                    {PAYMENT_METHOD[key]}
                                </MenuItem>
                            ))}
                        </Select>
                        {error ? <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText> : null}
                    </FormControl>
                )}
            />
            {paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT ? (
                <Controller
                    name="amount"
                    control={control}
                    rules={{
                        validate: (value) => {
                            if (paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT && isEmpty(value)) {
                                return 'Amount is required';
                            }
                            if (
                                paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT &&
                                !isEmpty(value) &&
                                value > grandTotal
                            ) {
                                return 'Amount exceeds grand total';
                            }
                            return true;
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FormInput
                            fullWidth
                            error={error}
                            field={field}
                            value={field.value || ''}
                            label="Amount"
                            onInput={decimalOnly}
                        />
                    )}
                />
            ) : null}
            <LoadingButton
                variant="contained"
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading || !paymentMethod}
            >
                PAY NOW
            </LoadingButton>
        </Stack>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                {billingLoading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : !isEmpty(billing) ? (
                    isMobile ? (
                        <Box>
                            {billingSummary}
                            {paymentControls}
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'primary.main' }}>Service</TableCell>
                                        <TableCell sx={{ color: 'primary.main' }}>Unit Price</TableCell>
                                        <TableCell sx={{ color: 'primary.main' }}>Qty</TableCell>
                                        <TableCell sx={{ color: 'primary.main' }}>Line Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{billingSummary}</TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ verticalAlign: 'top' }}>
                                            {paymentControls}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    )
                ) : null}
            </Box>
        </form>
    );
}

export default ContractInvoice;
