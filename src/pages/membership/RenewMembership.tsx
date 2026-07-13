import {useCallback, useContext, useEffect, useState, memo} from "react";
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import {Box, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography, useMediaQuery, useTheme} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {DISCOUNT_TYPE, PAYMENT_METHOD, SUB_ORDER_TYPE} from "../../utils/constants";
import Select from "@mui/material/Select";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {BillingTotal} from "../../services/payment.service";
import {GetPaymentPlan} from "../../services/payment.plan.service";
import ServicePackForm from "./ServicePack";
import {AdminContext} from "../../hooks/AdminContext";
import FormInput from "../../components/FormInput";
import {decimalOnly} from "../../utils/validations";
import InputAdornment from "@mui/material/InputAdornment";

import {debounce} from "@mui/material/utils";
import Switch from "@mui/material/Switch";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

interface MembershipBillingParams {
    orderType: SUB_ORDER_TYPE,
    customerId: string,
    membershipId?: string,
    paymentPlanId: string,
    membershipPlanId: string
    customAmount?: any
    includeJoiningFee?: boolean
}

interface RenewMembershipProps {
    record: any;
    callback: (data: any) => void;
    loading: boolean;
    customer: any;
}

interface BillingData {
    items: Array<{
        price: number;
        joiningFee: number;
        total: number;
    }>;
    currency: string;
    subtotal: number;
    discount?: {
        discountType: string;
        percentage?: number;
        isCapped?: boolean;
        discountAmount: number;
    };
    tax?: {
        name: string;
        rate: number;
        amount: number;
    };
    invoiceAmount: number;
}

dayjs.extend(utc);

const RenewMembership = memo(({record, callback, loading, customer}: RenewMembershipProps) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const adminContext = useContext(AdminContext)
    const [billing, setBilling] = useState<BillingData>({} as BillingData);
    const [billingLoader, setBillingLoader] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState(false);
    const currency = {
        code: (adminContext as any)?.admin?.currency?.code || '',
        symbol: (adminContext as any)?.admin?.currency?.symbol || ''
    }

    const defaultValues = {
        membershipId: record.id,
        paymentMethod: '',
        servicePacks: [],
        customAmount:null,
        endDate: null
    }
    const {control, setValue, handleSubmit, watch} = useForm({
        mode: "onChange",
        defaultValues
    })
    const servicePacks = watch('servicePacks')
    const paymentMethod = watch('paymentMethod')
    const customAmount = watch('customAmount')
    const endDate = watch('endDate')

    const fetchBilling = (input:MembershipBillingParams) => {
        setBillingLoader(true)
        BillingTotal(input).then((e) => {
            setBillingLoader(false)
            setBilling(e)
        }).catch(() => {
            setBillingLoader(false)
        })
    }

    const fetchPaymentPlan = (paymentPlanId: string) => {
        GetPaymentPlan(paymentPlanId).then((paymentPlan: any) => {
            const servicePacks = paymentPlan.servicePacks.filter((e: any) => e.service.commissionable === true)
            setValue('servicePacks', servicePacks.map((e: any) => {
                return {
                    serviceId: e.serviceId,
                    serviceName: e.service.name,
                    instructorId: '',
                }
            }))
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const handleAdvancedOptions = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAdvancedOptions(event.target.checked)
    }

    useEffect(() => {
        if(!isEmpty(record)){
            fetchBilling({orderType: SUB_ORDER_TYPE.MEMBERSHIP_RENEW, customerId: customer.id, membershipPlanId: record.membershipPlanId, paymentPlanId: record.paymentPlanId, membershipId: record.id})
            fetchPaymentPlan(record.paymentPlanId)
        }
    }, [record]);

    useEffect(() => {
        if (!advancedOptions && customAmount) {
            setValue('customAmount', null)
            fetchBilling({orderType: SUB_ORDER_TYPE.MEMBERSHIP_RENEW, customerId: customer.id, membershipPlanId: record.membershipPlanId, paymentPlanId: record.paymentPlanId, membershipId: record.id})
        }
    }, [advancedOptions]);

    const debouncedFetch = useCallback(
        debounce((customer: any, record: any, customAmount: any) => fetchBilling({orderType: SUB_ORDER_TYPE.MEMBERSHIP_RENEW, customerId: customer.id, membershipPlanId: record.membershipPlanId, paymentPlanId: record.paymentPlanId, membershipId: record.id, includeJoiningFee: false, customAmount}), 1200),
        []
    );

    useEffect(() => {
        if (customAmount) {
            debouncedFetch(customer, record, customAmount)
        } else {
            fetchBilling({orderType: SUB_ORDER_TYPE.MEMBERSHIP_RENEW, customerId: customer.id, membershipPlanId: record.membershipPlanId, paymentPlanId: record.paymentPlanId, membershipId: record.id})
        }
    }, [customAmount, debouncedFetch]);

    const onSubmit = async (data: any) => {
        const _data: any = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'paymentMethod':
                    _data[key] = {
                        name: '',
                        paymentScheme: data[key]
                    }
                    break
                case 'customAmount':
                    _data[key] = advancedOptions ? Number(data[key]) : undefined
                    break
                case 'servicePacks':
                    _data[key] = data[key].length ? data[key].map((e: any) => {
                        delete e.serviceName
                        return e
                    }) : []
                    break
                case 'endDate':
                    // Keep the endDate as is (already formatted as YYYY-MM-DD)
                    _data[key] = data[key]
                    break
                default:
                    _data[key] = data[key]
                    break
            }
        }
        callback(_data)
    };

    const billingSummary = !isEmpty(billing) && billing.items ? (
        <>
            {billing.items.map((e: any, index: number) => (
                isMobile ? (
                    <Box
                        key={index}
                        sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            {record.name}
                        </Typography>
                        <Stack spacing={0.5}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                                <Typography variant="body2">{billing.currency + e.price}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" color="text.secondary">Joining Fee</Typography>
                                <Typography variant="body2">{billing.currency + e.joiningFee}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" fontWeight={600}>Line Total</Typography>
                                <Typography variant="body2" fontWeight={600}>{billing.currency + e.total}</Typography>
                            </Stack>
                        </Stack>
                    </Box>
                ) : (
                    <TableRow key={index}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{billing.currency + e.price}</TableCell>
                        <TableCell>{billing.currency + e.joiningFee}</TableCell>
                        <TableCell>{billing.currency + e.total}</TableCell>
                    </TableRow>
                )
            ))}
            {isMobile ? (
                <Stack spacing={1} sx={{ pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Subtotal</Typography>
                        <Typography variant="body2" fontWeight="bold">{billing.currency + billing.subtotal}</Typography>
                    </Stack>
                    {billing.discount ? (
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2">
                                Discount{" "}
                                {billing.discount.discountType === DISCOUNT_TYPE.PERCENTAGE
                                    ? `${billing.discount.percentage}%${billing.discount.isCapped ? " - Capped" : ""}`
                                    : ""}
                            </Typography>
                            <Typography variant="body2">{billing.currency + billing.discount.discountAmount}</Typography>
                        </Stack>
                    ) : null}
                    {billing.tax ? (
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2">{billing.tax.name} ({billing.tax.rate}%)</Typography>
                            <Typography variant="body2">{billing.currency + billing.tax.amount}</Typography>
                        </Stack>
                    ) : null}
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Grand Total</Typography>
                        <Typography variant="body2" fontWeight="bold">{billing.currency + billing.invoiceAmount}</Typography>
                    </Stack>
                </Stack>
            ) : (
                <>
                    <TableRow>
                        <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Subtotal</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{billing.currency + billing.subtotal}</TableCell>
                    </TableRow>
                    {billing.discount ? (
                        <TableRow>
                            <TableCell colSpan={3}>
                                Discount{" "}
                                {billing.discount.discountType === DISCOUNT_TYPE.PERCENTAGE
                                    ? `${billing.discount.percentage}%${billing.discount.isCapped ? " - Capped" : ""}`
                                    : ""}
                            </TableCell>
                            <TableCell>{billing.currency + billing.discount.discountAmount}</TableCell>
                        </TableRow>
                    ) : null}
                    {billing.tax ? (
                        <TableRow>
                            <TableCell colSpan={3}>{billing.tax.name} ({billing.tax.rate}%)</TableCell>
                            <TableCell>{billing.currency + billing.tax.amount}</TableCell>
                        </TableRow>
                    ) : null}
                    <TableRow>
                        <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Grand Total</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{billing.currency + billing.invoiceAmount}</TableCell>
                    </TableRow>
                </>
            )}
        </>
    ) : null

    const paymentControls = (
        <Stack spacing={2} sx={{ mt: isMobile ? 2 : 0, pt: isMobile ? 2 : 0, borderTop: isMobile ? 1 : 0, borderColor: 'divider' }}>
            <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                    <FormControl error={!!error} fullWidth={true}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                {...field}
                                label="Membership End Date"
                                closeOnSelect={true}
                                format="YYYY-MM-DD"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                minDate={dayjs()}
                                slotProps={{
                                    textField: {
                                        variant: 'standard',
                                        error: !!error,
                                        helperText: error?.message,
                                        fullWidth: true,
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                )}
            />
            <Controller name="paymentMethod" control={control}
                rules={{
                    required: {
                        value: true,
                        message: "Payment method is required"
                    },
                }}
                render={({field, fieldState: {error}}) => (
                    <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                        <InputLabel>Payment method</InputLabel>
                        <Select label="Payment method" {...field} value={field.value || ''} error={!!error}>
                            {Object.keys(PAYMENT_METHOD).map((key: string) => {
                                return (<MenuItem value={key} key={key}>{(PAYMENT_METHOD as any)[key]}</MenuItem>)
                            })}
                        </Select>
                        {error && <FormHelperText sx={{ml: 0}}>{error.message}</FormHelperText>}
                    </FormControl>
                )}
            />
            <LoadingButton variant="contained" type="submit" fullWidth={true} loading={loading} disabled={loading || !paymentMethod }>PAY NOW</LoadingButton>
        </Stack>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
                <ProgressBar formLoader={loading}>
                    <></>
                </ProgressBar>
                <Box>
                    <ServicePackForm servicePacks={servicePacks} gymId={customer.gymId} setValue={setValue} control={control}/>

                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={advancedOptions}
                                    onChange={handleAdvancedOptions}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            }
                            label="Advanced Options"
                        />
                    </Box>
                    {
                        advancedOptions ?
                            <Box sx={{ py: 2 }}>
                                <Controller name="customAmount" control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Custom Amount'} onInput={decimalOnly} InputProps={{
                                            startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                                        }}/>
                                    )}
                                />
                            </Box>: <></>
                    }

                    {billingLoader ?
                        <Box sx={{textAlign: 'center', py: 2}}>
                            <CircularProgress/>
                        </Box> :
                        !isEmpty(billing) && billing.items ? (
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
                                                <TableCell sx={{color: 'primary.main'}}>Membership</TableCell>
                                                <TableCell sx={{color: 'primary.main'}}>Unit Price</TableCell>
                                                <TableCell sx={{color: 'primary.main'}}>Joining Fee</TableCell>
                                                <TableCell sx={{color: 'primary.main'}}>Line Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {billingSummary}
                                        </TableBody>
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
                        ) : null
                    }
                </Box>
            </Box>
        </form>
    )
})

export default RenewMembership