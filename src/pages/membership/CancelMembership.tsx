import {
    Box,
    Table,
    TableBody,
    TableFooter,
    TableCell,
    TableContainer,
    FormLabel,
    TableRow,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    FormHelperText,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import {isEmpty} from "lodash";
import {REFUND_TYPE, REFUND_TYPE_NAMES, ROUTES} from "../../utils/constants";
import {useContext} from "react";
import {Controller, useForm} from "react-hook-form";
import FormInput from "../../components/FormInput";
import LoadingButton from "@mui/lab/LoadingButton";
import {decimalOnly} from "../../utils/validations";
import {displayAmount} from "../../utils/format";
import {AdminContext} from "../../hooks/AdminContext";
import InputAdornment from "@mui/material/InputAdornment";

function DetailRow({ label, children, isMobile }) {
    if (isMobile) {
        return (
            <Box sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                    {label}
                </Typography>
                <Box sx={{ typography: 'body2', wordBreak: 'break-word' }}>{children}</Box>
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

function CancelMembership({record,customer,loading,callback}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext)
    const defaultValues = {
        membershipId: '',
        refundType: '',
        refundAmount: ''
    }
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }
    const {control, handleSubmit, watch} = useForm({
        mode: "onChange",
        defaultValues
    })
    const refundType = watch('refundType')
    const onSubmit = async (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'membershipId':
                    data[key] = record.id
                    break
                case 'refundAmount':
                    data[key] = refundType === REFUND_TYPE.FULL_REFUND ? parseFloat(record.total) : parseFloat(data[key])
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const detailRows = (
        <>
            <DetailRow label="Name" isMobile={isMobile}>
                <Link component={NavLink} to={ROUTES.MEMBERSHIP_PLAN.VIEW(record.membershipPlanId)} underline={'none'}>
                    {record.membershipPlan.name}
                </Link>
            </DetailRow>
            <DetailRow label="Joining Fee" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.joiningFee)}
            </DetailRow>
            <DetailRow label="Price" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.price)}
            </DetailRow>
            <DetailRow label="Subtotal" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.subtotal)}
            </DetailRow>
            <DetailRow label="Discount" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.discountedAmount)}
            </DetailRow>
            <DetailRow label="Tax Rate" isMobile={isMobile}>
                {record.taxRate + '%'}
            </DetailRow>
            <DetailRow label="Total Tax" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.totalTax)}
            </DetailRow>
            <DetailRow label="Grand total" isMobile={isMobile}>
                {displayAmount(customer.country.currency, record.total)}
            </DetailRow>
        </>
    );

    const refundFields = (
        <Stack spacing={2} sx={{ mt: isMobile ? 2 : 0 }}>
            <Controller name="refundType" control={control}
                rules={{
                    required: {
                        value: "required",
                        message: "Refund option is required"
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FormControl error={!!error} fullWidth>
                        <FormLabel>Refund Options</FormLabel>
                        <RadioGroup
                            row
                            {...field}
                            sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0, sm: 1 } }}
                        >
                            <FormControlLabel value={REFUND_TYPE.NO_REFUND} control={<Radio checked={refundType === REFUND_TYPE.NO_REFUND}/>} label={REFUND_TYPE_NAMES[REFUND_TYPE.NO_REFUND]}/>
                            <FormControlLabel value={REFUND_TYPE.FULL_REFUND} control={<Radio checked={refundType === REFUND_TYPE.FULL_REFUND}/>} label={REFUND_TYPE_NAMES[REFUND_TYPE.FULL_REFUND]}/>
                            <FormControlLabel value={REFUND_TYPE.CUSTOM} control={<Radio checked={refundType === REFUND_TYPE.CUSTOM}/>} label={REFUND_TYPE_NAMES[REFUND_TYPE.CUSTOM]}/>
                        </RadioGroup>
                        {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                    </FormControl>
                )}
            />
            {refundType === REFUND_TYPE.CUSTOM ? (
                <Controller name="refundAmount" control={control}
                    rules={{
                        validate: (value) => {
                            if (refundType === REFUND_TYPE.CUSTOM && isEmpty(value)) {
                                return "Amount is required";
                            }
                            if (refundType === REFUND_TYPE.CUSTOM && !isEmpty(value) && value>record.total) {
                                return "Amount exceeds actual price";
                            }
                            return true;
                        }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Amount'} onInput={decimalOnly} InputProps={{
                            startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                        }}/>
                    )}
                />
            ) : null}
            <LoadingButton variant="contained" type="submit" fullWidth={true} loading={loading} disabled={loading}>
                Cancel Membership
            </LoadingButton>
        </Stack>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
                {isMobile ? (
                    <Stack>
                        {detailRows}
                        {refundFields}
                    </Stack>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableBody>{detailRows}</TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={2} sx={{ borderBottom: 0, px: 0, pt: 2 }}>
                                        {refundFields}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </form>
    )
}

export default CancelMembership
