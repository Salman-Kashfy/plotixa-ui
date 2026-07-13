import PageTitle from "../../components/PageTitle";
import {
    Alert,
    Box,
    Card,
    CardContent, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableHead, TableFooter,
    TableRow,
    Typography,
} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import {AdminContext} from "../../hooks/AdminContext";
import {GetSubscriptionPlans, PurchaseSubscription, SubscriptionPaymentSchemes} from "../../services/subscription.service";
import {getAuthBrand} from "../../utils/permissions";
import {PAYMENT_SCHEME, SUBSCRIPTION_PAYMENT_STATUS, SUBSCRIPTION_PLAN_ACTION, SUBSCRIPTION_PLAN_TYPES, SUBSCRIPTION_STATUS} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {GetBrand} from "../../services/brand.service";
import CircularProgress from "@mui/material/CircularProgress";
import {capitalize, isEmpty, first} from "lodash";
import dayjs from "dayjs";
import LoadingButton from "@mui/lab/LoadingButton";
import {ToastContext} from "../../hooks/ToastContext";
import FormInput from "../../components/FormInput";
import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {GetPermissions, SetAuthUser, UserPermissions} from "../../services/auth/auth.service";

function Billing() {
    const breadcrumbContext: any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext: any = useContext(ToastContext)
    const stripe = useStripe();
    const elements = useElements();
    const brandId = getAuthBrand()
    const [brand, setBrand] = useState({})
    const [activeSubscription, setActiveSubscription] = useState({})
    const [subscriptionPlans, setSubscriptionPlans] = useState([])
    const [loader, setLoader] = useState(true)
    const [btnLoader, setBtnLoader] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('')
    const [action, setAction] = useState('')
    const [subscriptionPlanId, setSubscriptionPlanId] = useState('')
    const {handleSubmit, setValue, watch, control} = useForm({
        mode: "onChange",
        defaultValues: {
            brandId: brandId,
            transactionId: '',
            paymentScheme: '',
            subscriptionPaymentPlanId: '',
        }
    })

    const paymentScheme = watch('paymentScheme')
    const subscriptionPaymentPlanId = watch('subscriptionPaymentPlanId')

    const fetchSubscriptionPlans = () => {
        return new Promise((res) => {
            GetSubscriptionPlans({brandId}).then((response) => {
                const {list} = response
                setSubscriptionPlans(list)
                res(true)
            }).catch(() => {
                res(false)
            })
        })
    }

    const fetchBrand = () => {
        return new Promise((res) => {
            GetBrand(brandId).then(async (brand) => {
                if (brand.subscription.status === 'ACTIVE') {
                    const permissions = GetPermissions()
                    if (!permissions.length) {
                        await resetPermissions()
                    } else {
                        setBrand(brand)
                        setPaymentStatus(brand.subscription.paymentStatus)
                    }
                } else {
                    setBrand(brand)
                    setPaymentStatus(brand.subscription.paymentStatus)
                }
                res(true)
            }).catch(() => {
                res(false)
            })
        })
    }

    const fetchSubscriptionPaymentSchemes = () => {
        return new Promise((res) => {
            SubscriptionPaymentSchemes(brandId).then((schemes) => {
                setValue('paymentScheme', first(schemes))
                res(true)
            }).catch(() => {
                res(false)
            })
        })
    }

    const fetchData = async () => {
        setLoader(true)
        await Promise.all([fetchSubscriptionPlans(), fetchBrand(), fetchSubscriptionPaymentSchemes()])
        setLoader(false)
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Subscription'}, {name: 'Billing'}])
        fetchData()
    }, []);

    const initializePaymentPlan = (subscriptionPaymentPlanId) => {
        const result = subscriptionPlans.reduce((acc, plan) => {
            const matchedPlan = plan.subscriptionPaymentPlans.find((sp: any) => sp.id === subscriptionPaymentPlanId);
            if (matchedPlan) {
                acc = {
                    id: plan.id,
                    name: plan.name,
                    type: plan.type,
                    subscriptionPaymentPlan: {
                        id: matchedPlan.id,
                        name: matchedPlan.name,
                        price: matchedPlan.price,
                        gymCount: matchedPlan.gymCount,
                        duration: matchedPlan.duration,
                        billingCycle: matchedPlan.billingCycle,
                        description: matchedPlan.description,
                    }
                }
            }
            return acc;
        }, null);
        setActiveSubscription(result)
    }


    useEffect(() => {
        if (subscriptionPlans.length && !isEmpty(brand) && action) {
            if (action === SUBSCRIPTION_PLAN_ACTION.UPGRADE) {
                setActiveSubscription({})
            } else {
                initializePaymentPlan(brand.subscription.subscriptionPaymentPlanId)
            }
        }
    }, [subscriptionPlans, brand, action]);


    useEffect(() => {
        if (subscriptionPaymentPlanId) {
            initializePaymentPlan(subscriptionPaymentPlanId)
        } else {
            setActiveSubscription({})
        }
    }, [subscriptionPaymentPlanId]);

    useEffect(() => {
        if (!isEmpty(activeSubscription) && activeSubscription.type === SUBSCRIPTION_PLAN_TYPES.FREE_TRIAL) {
            setAction(SUBSCRIPTION_PLAN_ACTION.UPGRADE)
        }
    }, [activeSubscription]);

    const handleSubscriptionPlan = (e) => {
        setValue('subscriptionPaymentPlanId', '')
        setSubscriptionPlanId(e.target.value)
    }

    const handlePaymentPlan = (id) => {
        setValue('subscriptionPaymentPlanId', id)
    }

    const handleAction = (e) => {
        if (e.target.value === SUBSCRIPTION_PLAN_ACTION.RENEW) {
            setValue('subscriptionPaymentPlanId', brand.subscription.subscriptionPaymentPlanId)
        }
        setAction(e.target.value)
    }

    const resetPermissions = () => {
        return new Promise((res) => {
            UserPermissions().then((response) => {
                if (response.status && response.data.length > 1) {
                    adminContext.setPermissions(response.data)
                    const admin = adminContext.admin
                    admin.subscriptionStatus = 'ACTIVE'
                    SetAuthUser(admin);
                    adminContext.setAdmin(admin)
                }
                res(response.status && response.data.length > 1)
            }).catch((error) => {
                res(false)
            })
        })
    }

    const onSubmit = async (data) => {
        setBtnLoader(true)
        if (paymentScheme === PAYMENT_SCHEME.CARD) {
            const {error: stripeError, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            })
            if (stripeError) {
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(stripeError.message)
                toastContext.setToast(true)
                setBtnLoader(false)
                return;
            } else {
                data.paymentMethodId = paymentMethod.id
            }
        }

        PurchaseSubscription(data).then(async (response) => {
            if (response.status) {
                if (paymentScheme === PAYMENT_SCHEME.CARD) {
                    toastContext.setToastSeverity('success')
                    toastContext.setToastMessage('Processed successfully.')
                    toastContext.setToast(true)
                    const delay = () => {
                        return new Promise((res) => {
                            setTimeout(function () {
                                GetBrand(brandId).then(async (brand) => {
                                    if (brand.subscription.status === 'ACTIVE') {
                                        await resetPermissions()
                                        res(true)
                                    }
                                }).catch(() => {
                                    res(true)
                                })
                            }, 2500)
                        })
                    }
                    await delay()
                } else if (paymentScheme === PAYMENT_SCHEME.ONLINE_TRANSFER) {
                    setPaymentStatus(SUBSCRIPTION_PAYMENT_STATUS.PENDING)
                    toastContext.setToastSeverity('success')
                    toastContext.setToastMessage('Processed successfully.')
                    toastContext.setToast(true)
                }
            } else {
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
                toastContext.setToast(true)
            }
            setBtnLoader(false)
        }).catch((e: any) => {
            console.log(e)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage(e.errorMessage)
            toastContext.setToast(true)
            setBtnLoader(false)
        })
    }

    return (
        <>
            <PageTitle title={'Billing'}/>
            <>
                {loader ?
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <CircularProgress color="primary"/>
                    </Box>
                    :
                    <Box>
                        {paymentStatus === SUBSCRIPTION_PAYMENT_STATUS.PENDING ?
                            <Alert severity="info">
                                <Box>
                                    <Typography variant="body1" sx={{fontWeight: 500}}>Payment Under Review</Typography>
                                    <Typography variant="body2">Thank you for your payment! We're currently verifying
                                        the transaction. You'll receive a confirmation shortly.</Typography>
                                </Box>
                            </Alert>
                            :
                            <>
                                {
                                    brand.subscription.status === SUBSCRIPTION_STATUS.EXPIRED ?
                                        <Alert severity="error" sx={{mb: 3}}>
                                            <Box>
                                                <Typography variant="body1" sx={{fontWeight: 500}}>Your access has been
                                                    paused</Typography>
                                                <Typography variant="body2">To continue using CloudFitnest, please renew
                                                    your subscription. We’re here to help if you need
                                                    assistance!</Typography>
                                            </Box>
                                        </Alert>
                                        : <></>
                                }

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{mb: 2}}>
                                                <FormControl onChange={handleAction}>
                                                    <FormLabel>Subscription Action</FormLabel>
                                                    <RadioGroup row>
                                                        <FormControlLabel value={SUBSCRIPTION_PLAN_ACTION.RENEW}
                                                                          disabled={brand.subscription.type === SUBSCRIPTION_PLAN_TYPES.FREE_TRIAL}
                                                                          control={<Radio
                                                                              checked={action === SUBSCRIPTION_PLAN_ACTION.RENEW}/>}
                                                                          label={capitalize(SUBSCRIPTION_PLAN_ACTION.RENEW)}/>
                                                        <FormControlLabel value={SUBSCRIPTION_PLAN_ACTION.UPGRADE}
                                                                          control={<Radio
                                                                              checked={action === SUBSCRIPTION_PLAN_ACTION.UPGRADE}/>}
                                                                          label={capitalize(SUBSCRIPTION_PLAN_ACTION.UPGRADE)}/>
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{mb: 2}}>
                                                {
                                                    action === SUBSCRIPTION_PLAN_ACTION.UPGRADE ?
                                                        <FormControl onChange={handleSubscriptionPlan}>
                                                            <FormLabel>Subscription Plan</FormLabel>
                                                            <RadioGroup row>
                                                                {
                                                                    subscriptionPlans.filter((e) => e.type !== SUBSCRIPTION_PLAN_TYPES.FREE_TRIAL).map((e) => {
                                                                        return (
                                                                            <FormControlLabel value={e.id} key={e.id}
                                                                                              control={<Radio
                                                                                                  checked={subscriptionPlanId === e.id}/>}
                                                                                              label={e.name}/>
                                                                        )
                                                                    })
                                                                }
                                                            </RadioGroup>
                                                        </FormControl>
                                                        : <></>
                                                }
                                            </Box>
                                            {
                                                subscriptionPlanId && action === SUBSCRIPTION_PLAN_ACTION.UPGRADE ?
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell></TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>Payment
                                                                    Plan</TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>No. of
                                                                    Gyms</TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>Billing
                                                                    Cycle</TableCell>
                                                                <TableCell
                                                                    sx={{color: 'primary.main'}}>Price</TableCell>
                                                                <TableCell
                                                                    sx={{color: 'primary.main'}}>Description</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                subscriptionPlans.find((e) => e.id === subscriptionPlanId).subscriptionPaymentPlans.map((e, index) => {
                                                                    return (
                                                                        <TableRow key={'subscription-plan-' + index}>
                                                                            <TableCell align="center">
                                                                                <Radio
                                                                                    checked={subscriptionPaymentPlanId === e.id}
                                                                                    disabled={e.id === brand.subscription.subscriptionPaymentPlanId}
                                                                                    onChange={() => handlePaymentPlan(e.id)}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>{e.id === brand.subscription.subscriptionPaymentPlanId ? `${e.name} (Active)` : e.name}</TableCell>
                                                                            <TableCell>{e.gymCount}</TableCell>
                                                                            <TableCell>{e.duration} {e.billingCycle.toLowerCase()}</TableCell>
                                                                            <TableCell>{e.country.currency.symbol + e.price}</TableCell>
                                                                            <TableCell>{e.description}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                    : <></>
                                            }
                                            {
                                                action && !isEmpty(activeSubscription) && (action === SUBSCRIPTION_PLAN_ACTION.RENEW || (action === SUBSCRIPTION_PLAN_ACTION.UPGRADE && subscriptionPaymentPlanId)) ?
                                                    <TableContainer>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell sx={{color: 'primary.main'}}>Subscription
                                                                        Plan</TableCell>
                                                                    <TableCell sx={{color: 'primary.main'}}>Payment
                                                                        Plan</TableCell>
                                                                    <TableCell sx={{color: 'primary.main'}}>No. of
                                                                        Gyms</TableCell>
                                                                    <TableCell sx={{color: 'primary.main'}}>Valid
                                                                        till</TableCell>
                                                                    <TableCell
                                                                        sx={{color: 'primary.main'}}>Price</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell>{activeSubscription.name}</TableCell>
                                                                    <TableCell>{activeSubscription.subscriptionPaymentPlan.name}</TableCell>
                                                                    <TableCell>{activeSubscription.subscriptionPaymentPlan.gymCount}</TableCell>
                                                                    <TableCell>{dayjs(brand.subscription.status === SUBSCRIPTION_STATUS.EXPIRED ? dayjs() : brand.subscription.expiryDate).add(activeSubscription.subscriptionPaymentPlan.duration, activeSubscription.subscriptionPaymentPlan.billingCycle).format("MMM DD, YYYY")}</TableCell>
                                                                    <TableCell>{adminContext.admin.currency.symbol + activeSubscription.subscriptionPaymentPlan.price}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                            <TableFooter>
                                                                {
                                                                    paymentScheme === PAYMENT_SCHEME.ONLINE_TRANSFER ?
                                                                        <TableRow>
                                                                            <TableCell colSpan={2}>
                                                                                <Controller name="transactionId"
                                                                                            control={control}
                                                                                            rules={{
                                                                                                required: {
                                                                                                    value: "required",
                                                                                                    message: "Transaction ID is required"
                                                                                                },
                                                                                                maxLength: {
                                                                                                    value: 100,
                                                                                                    message: "Transaction ID must not exceed 100 characters"
                                                                                                },
                                                                                            }}
                                                                                            render={({field, fieldState: {error}}) => (
                                                                                                <FormInput
                                                                                                    fullWidth={true}
                                                                                                    error={error}
                                                                                                    field={field}
                                                                                                    value={field.value || ''}
                                                                                                    label={'Transaction ID'}/>
                                                                                            )}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        : <TableRow>
                                                                            <TableCell colSpan={5}>
                                                                                <CardElement
                                                                                    options={{
                                                                                        hidePostalCode: true,
                                                                                        style: {
                                                                                            base: {
                                                                                                fontSize: '16px',
                                                                                                color: '#424770',
                                                                                                '::placeholder': {
                                                                                                    color: '#aab7c4',
                                                                                                },
                                                                                            },
                                                                                            invalid: {
                                                                                                color: '#9e2146',
                                                                                            },
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                }
                                                                <TableRow>
                                                                    <TableCell colSpan={5}>
                                                                        <LoadingButton variant="contained" type="submit"
                                                                                       loading={btnLoader}
                                                                                       disabled={btnLoader}>Checkout</LoadingButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableFooter>
                                                        </Table>
                                                    </TableContainer>
                                                    : <></>
                                            }
                                        </CardContent>
                                    </Card>
                                </form>
                            </>
                        }
                    </Box>
                }
            </>
        </>
    )
}

export default Billing