import {Fragment, useCallback, useContext, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import {Box, Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography, useMediaQuery, useTheme} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {GetMembershipPlans} from "../../services/membership.plan.service";
import {GetPaymentPlans} from "../../services/payment.plan.service";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {DISCOUNT_TYPE, ORDER_TYPE, PAYMENT_METHOD, PAYMENT_OPTION,} from "../../utils/constants";
import Select from "@mui/material/Select";
import {decimalOnly} from "../../utils/validations";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {BillingTotal} from "../../services/payment.service";
import Grid from "@mui/material/Grid2";
import Switch from '@mui/material/Switch';
import ServicePackForm from "./ServicePack";
import {displayAmount} from "../../utils/format";
import * as React from "react";
import {AdminContext} from "../../hooks/AdminContext";
import InputAdornment from "@mui/material/InputAdornment";
import {debounce} from "@mui/material/utils";

interface MembershipBillingParams {
    orderType:ORDER_TYPE,
    customerId:string,
    membershipId?:string,
    paymentPlanId:string,
    membershipPlanId:string
    includeJoiningFee:boolean
    customAmount?:any
}

dayjs.extend(utc);

function MembershipInvoice({record = {}, callback, loading, customer}) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const adminContext = useContext(AdminContext)
    const [mpLoader, setMPLoader] = useState(false);
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [membershipPlanId, setMembershipPlanId] = useState({});

    const [ppLoader, setPPLoader] = useState(false);
    const [paymentPlans, setPaymentPlans] = useState([]);
    const [paymentPlanId, setPaymentPlanId] = useState({});

    const [paymentOption, setPaymentOption] = useState(PAYMENT_OPTION.FULL_PAYMENT);
    const [billing, setBilling] = useState({});
    const [billingLoader, setBillingLoader] = useState(false);
    const [grandTotal, setGrandTotal] = useState(0);
    const [advancedOptions, setAdvancedOptions] = useState(false);
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }

    const defaultValues = {
        id: '',
        amount: null,
        customerId: customer.id,
        membershipPlanId: null,
        paid: false,
        includeJoiningFee: true,
        paymentPlanId: null,
        servicePacks: [],
        startDate: '',
        endDate: '',
        paymentMethod: '',
        customAmount: null,
    }
    const {control, handleSubmit, setValue, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const servicePacks = watch('servicePacks')
    const paymentMethod = watch('paymentMethod')
    const includeJoiningFee = watch('includeJoiningFee')
    const customAmount = watch('customAmount')
    const startDate = watch('startDate')
    const endDate = watch('endDate')

    const handleMembershipPlanChange = (event: any, value: { value: string, label: string } | null) => {
        if(membershipPlanId?.value !== value?.value){
            setValue('membershipPlanId', value?.value)
            setMembershipPlanId({label: value?.label, value: value?.value})
            if(value?.value){
                fetchPaymentPlans(customer.gym.brandId, value?.value)
            }
            setValue('paymentPlanId', '')
            setPaymentPlans([])
            setPaymentPlanId({})
            setBilling({})
        }
    }

    const handlePaymentPlanChange = (event: any, value: { value: string, label: string } | null) => {
        if(paymentPlanId?.value !== value?.value){
            setValue('paymentPlanId', value?.value)
            setPaymentPlanId({label: value?.label, value: value?.value})
            if(value?.value){
                fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: membershipPlanId.value, paymentPlanId:value.value,includeJoiningFee,customAmount})
                const paymentPlan = paymentPlans.find((e) => e.value === value.value)
                if(paymentPlan.servicePacks.some((e) => e.service.commissionable === true)) {
                    const servicePacks = paymentPlan.servicePacks.filter((e) => e.service.commissionable === true)
                    setValue('servicePacks',servicePacks.map((e:any) => {
                        return {
                            serviceId: e.serviceId,
                            serviceName: e.service.name,
                            instructorId: '',
                        }
                    }))
                }else{
                    setValue('servicePacks', [])
                }
            }else {
                setBilling({})
                setValue('servicePacks', [])
            }
        }
    }

    const handleJoiningFee = (event) => {
        setValue('includeJoiningFee',event.target.checked)
        if(paymentPlanId?.value){
            fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: membershipPlanId.value, paymentPlanId:paymentPlanId.value, includeJoiningFee:event.target.checked, customAmount})
        }
    }

    const handleAdvancedOptions = (event) => {
        setAdvancedOptions(event.target.checked)
    }

    useEffect(() => {
        if(!advancedOptions && customAmount){
            setValue('customAmount',null)
            fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: membershipPlanId.value, paymentPlanId:paymentPlanId.value,includeJoiningFee})
        }
    }, [advancedOptions]);

    const debouncedFetch = useCallback(
        debounce((customer, membershipPlanId, paymentPlanId, customAmount) => fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: membershipPlanId.value, paymentPlanId:paymentPlanId.value,includeJoiningFee:false, customAmount}), 1200),
        []
    );

    useEffect(() => {
        if (customAmount){
            debouncedFetch(customer, membershipPlanId, paymentPlanId, customAmount)
        } else {
            fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: membershipPlanId.value, paymentPlanId:paymentPlanId.value,includeJoiningFee})
        }
    }, [customAmount, debouncedFetch]);

    const fetchMembershipPlans = (brandId) => {
        setMPLoader(true)
        GetMembershipPlans({limit:0},{brandId}).then((membershipPlans:any) => {
            const { list } = membershipPlans
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setMembershipPlans(rows)
            setMPLoader(false)
        }).catch((e) => {
            setMPLoader(false)
            console.log(e.message)
        })
    }

    const fetchPaymentPlans = (brandId, membershipPlanId) => {
        setPPLoader(true)
        GetPaymentPlans({limit:0},{brandId, membershipPlanId}).then((paymentPlans:any) => {
            const { list } = paymentPlans
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name, servicePacks: e.servicePacks }
            })
            setPaymentPlans(rows)
            setPPLoader(false)
        }).catch((e) => {
            setPPLoader(false)
            console.log(e.message)
        })
    }

    const fetchBilling = (input:MembershipBillingParams) => {
        setBillingLoader(true)
        BillingTotal(input).then((e) => {
            setBillingLoader(false)
            setGrandTotal(e.total)
            setBilling(e)
        }).catch(() => {
            setBillingLoader(false)
        })
    }

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'amount':
                    break;
                default:
                    _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
            }
        }
        reset(_data)
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            setMembershipPlanId({label: record.membershipPlan.name, value: record.membershipPlanId})
            setPaymentPlanId({label: record.paymentPlan.name, value: record.paymentPlanId})
            fetchPaymentPlans(customer.gym.brandId, record.membershipPlanId)
            fetchBilling({orderType: ORDER_TYPE.MEMBERSHIP, customerId: customer.id, membershipPlanId: record.membershipPlanId, paymentPlanId: record.paymentPlanId, membershipId: record.id, customAmount})
        }
    }, [record]);

    useEffect(() => {
        fetchMembershipPlans(customer.gym.brandId)
    },[])

    const onSubmit = async (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'amount':
                    data[key] = paymentOption === PAYMENT_OPTION.FULL_PAYMENT ? Number(billing.total) : Number(data[key])
                    break
                case 'customAmount':
                    data[key] = advancedOptions ? Number(data[key]) : undefined
                    break
                case 'startDate':
                    const currentDate = dayjs().utc();
                    const inputDate = dayjs(data.startDate || undefined);
                    const isToday = inputDate.isSame(currentDate, 'day');
                    data[key] = isToday
                        ? currentDate.format('YYYY-MM-DD HH:mm:ss')
                        : inputDate.format('YYYY-MM-DD HH:mm:ss')

                    break
                case 'endDate':
                    data[key] = data[key] ? dayjs(data[key]).toISOString() : undefined
                    break
                case 'paymentMethod':
                    data[key] = {
                        name: '',
                        paymentScheme: data[key]
                    }
                    break
                case 'paid':
                case 'includeJoiningFee':
                    data[key] = data[key] === true || (typeof data[key] === "string" && data[key] === "true");
                    break
                case 'servicePacks':
                    data[key] = data[key].length ? data[key].map(e => {
                        delete e.serviceName
                        return e
                    }) : []
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const billingSummary = !isEmpty(billing) ? (
        <>
            {billing.items.map((e, index) => (
                isMobile ? (
                    <Box
                        key={e.paymentPlanId || e.paymentPlanName || index}
                        sx={{
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            {e.paymentPlanName}
                        </Typography>
                        <Stack spacing={0.5}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                                <Typography variant="body2">{displayAmount({symbol: billing.currency}, e.price)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" color="text.secondary">Joining Fee</Typography>
                                <Typography variant="body2">{displayAmount({symbol: billing.currency}, e.joiningFee)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" fontWeight={600}>Line Total</Typography>
                                <Typography variant="body2" fontWeight={600}>{displayAmount({symbol: billing.currency}, e.total)}</Typography>
                            </Stack>
                        </Stack>
                    </Box>
                ) : (
                    <TableRow key={e.paymentPlanId || e.paymentPlanName || index}>
                        <TableCell>{e.paymentPlanName}</TableCell>
                        <TableCell>{displayAmount({symbol: billing.currency}, e.price)}</TableCell>
                        <TableCell>{displayAmount({symbol: billing.currency}, e.joiningFee)}</TableCell>
                        <TableCell>{displayAmount({symbol: billing.currency}, e.total)}</TableCell>
                    </TableRow>
                )
            ))}
            {isMobile ? (
                <Stack spacing={1} sx={{ pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Subtotal</Typography>
                        <Typography variant="body2" fontWeight="bold">{displayAmount({symbol: billing.currency}, billing.subtotal)}</Typography>
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
                    {billing.tax.amount ? (
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2">{billing.tax.name} ({billing.tax.rate}%)</Typography>
                            <Typography variant="body2">{billing.currency + billing.tax.amount}</Typography>
                        </Stack>
                    ) : null}
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Grand Total</Typography>
                        <Typography variant="body2" fontWeight="bold">{displayAmount({symbol: billing.currency}, billing.invoiceAmount)}</Typography>
                    </Stack>
                    {billing.amountPaid ? (
                        <>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2">Total Paid</Typography>
                                <Typography variant="body2">{billing.currency + billing.amountPaid}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="body2" fontWeight="bold">Dues Total</Typography>
                                <Typography variant="body2" fontWeight="bold">{billing.currency + billing.total}</Typography>
                            </Stack>
                        </>
                    ) : null}
                </Stack>
            ) : (
                <>
                    <TableRow>
                        <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Subtotal</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{displayAmount({symbol: billing.currency}, billing.subtotal)}</TableCell>
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
                    {billing.tax.amount ? (
                        <TableRow>
                            <TableCell colSpan={3}>{billing.tax.name} ({billing.tax.rate}%)</TableCell>
                            <TableCell>{billing.currency + billing.tax.amount}</TableCell>
                        </TableRow>
                    ) : null}
                    <TableRow>
                        <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Grand Total</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{displayAmount({symbol: billing.currency}, billing.invoiceAmount)}</TableCell>
                    </TableRow>
                    {billing.amountPaid ? (
                        <>
                            <TableRow>
                                <TableCell colSpan={3}>Total Paid</TableCell>
                                <TableCell>{billing.currency + billing.amountPaid}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Dues Total</TableCell>
                                <TableCell>{billing.currency + billing.total}</TableCell>
                            </TableRow>
                        </>
                    ) : null}
                </>
            )}
        </>
    ) : null

    const paymentControls = (
        <Stack spacing={2} sx={{ mt: isMobile ? 2 : 0, pt: isMobile ? 2 : 0, borderTop: isMobile ? 1 : 0, borderColor: 'divider' }}>
            <Controller name="paymentMethod" control={control}
                rules={{
                    required: {
                        value: "required",
                        message: "Payment method is required"
                    },
                }}
                render={({field, fieldState: {error}}) => (
                    <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                        <InputLabel>Payment method</InputLabel>
                        <Select label="Payment method" {...field} value={field.value || ''} error={!!error}>
                            {Object.keys(PAYMENT_METHOD).map((key: string) => {
                                return (<MenuItem value={key} key={key}>{PAYMENT_METHOD[key]}</MenuItem>)
                            })}
                        </Select>
                        {error && <FormHelperText sx={{ml: 0}}>{error.message}</FormHelperText>}
                    </FormControl>
                )}
            />
            {paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT ? (
                <Controller name="amount" control={control}
                    rules={{
                        validate: (value) => {
                            if (paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT && isEmpty(value)) {
                                return "Amount is required";
                            }
                            if (paymentOption === PAYMENT_OPTION.CUSTOM_AMOUNT && !isEmpty(value) && value > grandTotal) {
                                return "Amount exceeds grand total";
                            }
                            return true;
                        }
                    }}
                    render={({field, fieldState: {error}}) => (
                        <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Amount'} onInput={decimalOnly}/>
                    )}
                />
            ) : null}
            <LoadingButton variant="contained" type="submit" fullWidth={true} loading={loading} disabled={loading || !paymentMethod}>PAY NOW</LoadingButton>
        </Stack>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
                <ProgressBar formLoader={loading}/>
                <Box>
                    <Box sx={{mb:2}}>
                        <Controller name="membershipPlanId" control={control}
                            rules={{
                                required: {
                                    value: "required",
                                    message: "Membership plan is required"
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <Autocomplete
                                    id="mp-dd"
                                    options={membershipPlans}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={membershipPlanId}
                                    loading={mpLoader}
                                    disabled={!isEmpty(record)}
                                    onChange={handleMembershipPlanChange}
                                    renderInput={(params) => <FormInput fullWidth={true} disabled={!membershipPlans.length} error={error} label={'Membership plan'} params={params}
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <Fragment>
                                                        {mpLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </Fragment>
                                                ),
                                            },
                                        }}
                                    />}
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{mb:2}}>
                        <Controller name="paymentPlanId" control={control}
                            rules={{
                                required: {
                                    value: "required",
                                    message: "Payment plan is required"
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <Autocomplete
                                    id="pp-dd"
                                    options={paymentPlans}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={paymentPlanId}
                                    loading={ppLoader}
                                    disabled={!isEmpty(record)}
                                    onChange={handlePaymentPlanChange}
                                    renderInput={(params) => <FormInput fullWidth={true} disabled={!paymentPlans.length} error={error} label={'Payment plan'} params={params}
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <Fragment>
                                                        {ppLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </Fragment>
                                                ),
                                            },
                                        }}
                                    />}
                                />
                            )}
                        />
                    </Box>
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
                        <Box sx={{mb:2}}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="startDate" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (value && endDate && dayjs(value).isAfter(dayjs(endDate))) {
                                                    return "Start date cannot be after end date";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} fullWidth={true}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Start date"
                                                        closeOnSelect={true}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        format="MMM DD, YYYY"
                                                        disabled={!isEmpty(record)}
                                                        // maxDate={endDate ? dayjs(endDate) : undefined}
                                                        onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'standard',
                                                                sx:{width:'100%'},
                                                                error: !!error,
                                                                helperText: error?.message
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="endDate" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (value && startDate && dayjs(startDate).isAfter(dayjs(value))) {
                                                    return "End date cannot be before start date";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} fullWidth={true}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="End date"
                                                        closeOnSelect={true}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        format="MMM DD, YYYY"
                                                        disabled={!isEmpty(record)}
                                                        // minDate={startDate ? dayjs(startDate) : undefined}
                                                        onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'standard',
                                                                sx:{width:'100%'},
                                                                error: !!error,
                                                                helperText: error?.message
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="includeJoiningFee" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error}>
                                                <FormControlLabel control={<Checkbox checked={field.value === true || field.value === 'true'}/>} label="Include Joining Fee" onChange={handleJoiningFee} disabled={!!Number(customAmount)}/>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="customAmount" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Custom Amount'} onInput={decimalOnly} InputProps={{
                                                startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                                            }}/>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box> : <></>
                    }
                    {billingLoader ?
                        <Box sx={{textAlign: 'center', py: 2}}>
                            <CircularProgress/>
                        </Box> :
                        !isEmpty(billing) ? (
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
                                                <TableCell sx={{color: 'primary.main'}}>Payment Plan</TableCell>
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
}

export default MembershipInvoice