import {Fragment, useContext, useEffect, useState} from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText, Checkbox, InputLabel, Select, MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import FormInput from "../../components/FormInput";
import {decimalOnly,numberOnly} from "../../utils/validations";
import {GetServices} from "../../services/service.service";
import {GetMembershipPlans} from "../../services/membership.plan.service";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {GetBrands} from "../../services/brand.service";
import CircularProgress from "@mui/material/CircularProgress";
import {PAYMENT_PLAN_INTERVAL, PAYMENT_TYPE, ROLE} from "../../utils/constants";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthBrand} from "../../utils/permissions";
import {capitalize} from "lodash";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function PaymentPlanForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [services, setServices] = useState([]);
    const [serviceLoader, setServiceLoader] = useState(false);
    const [brandId, setBrandId] = useState({});
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const [mpLoader, setMPLoader] = useState(false);
    const defaultValues = {
        id: '',
        name: '',
        type: PAYMENT_TYPE.SINGLE, // temporary
        price: '',
        hasEndDate: true, // temporary
        allowFreeze: true, // temporary
        joiningFee: '',
        recursionPeriod: '',
        recursionDuration: null,
        chargeOnFirst: null,
        membershipPlan: {},
        membershipPlanId: '',
        servicePacks: [],
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const type = watch('type')
    const servicePacks = watch('servicePacks')
    const recursionPeriod = watch('recursionPeriod')
    const membershipPlanId = watch('membershipPlanId')
    const onSubmit = async (data) => {
        delete data?.membershipPlan
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'price':
                case 'joiningFee':
                case 'recursionDuration':
                    data[key] = Number(data[key])
                    break
                case 'hasEndDate':
                case 'allowFreeze':
                case 'chargeOnFirst':
                    data[key] = data[key] === true || (typeof data[key] === "string" && data[key] === "true");
                    break
                case 'servicePacks':
                    data[key] = data[key].length ? data[key].map((e) => {
                        return {serviceId:e.serviceId, serviceQty:1}
                    }) : []
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key].toString() || '') : data[key]
        }
        reset(_data)
    }

    const fetchServices = (brandId) => {
        return new Promise((resolve) => {
            setServiceLoader(true)
            GetServices({limit:0},{servicePack:true,brandId}).then((services:any) => {
                const { list } = services
                const rows = list.map((e:any) => {
                    return { value: e.id, label: e.name, selected: false }
                })
                setServices(rows)
                setServiceLoader(false)
                resolve(rows)
            }).catch((e) => {
                resolve([])
                setServiceLoader(false)
                console.log(e.message)
            })
        })
    }

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

    const fetchBrands = () => {
        setBrandLoader(true)
        GetBrands({limit:0}).then((brands:any) => {
            const { list } = brands
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setBrands(rows)
            setBrandLoader(false)
        }).catch((e) => {
            setBrandLoader(false)
            console.log(e.message)
        })
    }

    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection && brandId?.value !== value?.value){
            setServices([])
            setValue('servicePacks', [])
            setValue('membershipPlanId', '')
            setBrandId({label: value?.label, value: value?.value})
            if(value?.value){
                fetchServices(value?.value)
                fetchMembershipPlans(value?.value)
            }
        }
    }

    const handleMPChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('membershipPlanId', value?.value)
    }

    const handleSPServiceChange = (spServices) => {
        setValue('servicePacks', spServices.map((e) => {
            return {
                serviceId: e.value,
                serviceQty: 1,
            }
        }))
        setServices(services.map((e) => {
            e.selected = spServices.some((_e) => _e.value === e.value)
            return e
        }))
    };

    useEffect(() => {
        if(brandSelection){
            fetchBrands()
        }else{
            fetchMembershipPlans(getAuthBrand())
            if(create){
                fetchServices(getAuthBrand())
            }
        }
    }, []);

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            if(brandSelection){
                setBrandId({label: record.membershipPlan.group.brand.name, value: record.membershipPlan.group.brand.id})
                fetchMembershipPlans(record.membershipPlan.group.brand.id);
            }
            (async () => {
                try {
                    const rows = await fetchServices(brandSelection ? record.membershipPlan.group.brand.id : getAuthBrand())
                    setServices(rows.map((e:any) => {
                        return { value: e.value, label: e.label, selected: record?.servicePacks?.length ? record.servicePacks.some((servicePack) => servicePack.serviceId === e.value ) : false }
                    }))
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [record]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Payment Plan Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="name" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Name is required"
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: "Name must not exceed 50 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="price" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Price is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Price ' + (!isEmpty(record) ? `(${record?.membershipPlan?.group?.brand?.country?.currency?.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="joiningFee" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Joining Fee is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Joining Fee ' + (!isEmpty(record) ? `(${record?.membershipPlan?.group?.brand?.country?.currency?.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Grid>
                                {
                                    brandSelection ?
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Autocomplete
                                                id="brands-dd"
                                                options={brands}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={brandId}
                                                loading={brandLoader}
                                                onChange={handleBrandChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!brands.length} label={'Brand'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {brandLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                                    {params.InputProps.endAdornment}
                                                                </Fragment>
                                                            ),
                                                        },
                                                    }}
                                                />}
                                            />
                                        </Grid>
                                    :<></>
                                }
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="membershipPlanId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Membership Plan is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="mp-plan-dd"
                                                options={membershipPlans}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={membershipPlanId && membershipPlans.length ? {value:membershipPlanId,label: membershipPlans.find((e) => e.value === membershipPlanId).label} : {}}
                                                loading={mpLoader}
                                                onChange={handleMPChange}
                                                renderInput={(params) => <FormInput fullWidth={true} error={error} disabled={!membershipPlans.length} label={'Membership Plan'} params={params}
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
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="servicePacks" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                multiple
                                                id="checkboxes-brands"
                                                options={services}
                                                value={services.filter((e) => e.selected === true)}
                                                loading={serviceLoader}
                                                disableCloseOnSelect
                                                getOptionLabel={(option) => option.label}
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue);
                                                    handleSPServiceChange(newValue);
                                                }}
                                                renderOption={(props, option, { selected }) => {
                                                    const { key, ...optionProps } = props;
                                                    return (
                                                        <li key={key} {...optionProps}>
                                                            <Checkbox
                                                                icon={icon}
                                                                checkedIcon={checkedIcon}
                                                                style={{ marginRight: 8 }}
                                                                checked={selected}
                                                            />
                                                            {option.label}
                                                        </li>
                                                    );
                                                }}
                                                renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Service Pack'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {serviceLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                                    {params.InputProps.endAdornment}
                                                                </Fragment>
                                                            ),
                                                        },
                                                    }}
                                                />}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                        <LoadingButton
                            variant="contained"
                            type="submit"
                            loading={loading}
                            disabled={loading || mpLoader || serviceLoader || brandLoader}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            {btnLabel}
                        </LoadingButton>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} order={{ xs: 1, md: 2 }}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Plan Options</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="recursionPeriod" control={control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Period is required"
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                            <InputLabel>Period</InputLabel>
                                            <Select label="Period" {...field} value={field.value || ''} error={!!error}>
                                                {Object.keys(PAYMENT_PLAN_INTERVAL)
                                                    .map((value) => <MenuItem value={value} key={value}>{capitalize(value)}</MenuItem>)
                                                }
                                            </Select>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="recursionDuration" control={control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Duration is required"
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Duration' + ( recursionPeriod ? ' In '+recursionPeriod.toLowerCase()+'(s)' : '' ) } onInput={numberOnly}/>
                                    )}
                                />
                            </Box>

                            {/*<Box sx={{mb:2}}>*/}
                            {/*    <Controller name="allowFreeze" control={control}*/}
                            {/*        rules={{*/}
                            {/*            validate: (value) => {*/}
                            {/*                if (value === '' || value === null){*/}
                            {/*                    return "Freeze is required";*/}
                            {/*                }*/}
                            {/*                return true;*/}
                            {/*            }*/}
                            {/*        }}*/}
                            {/*        render={({ field, fieldState: { error } }) => (*/}
                            {/*            <FormControl error={!!error}>*/}
                            {/*                <FormLabel>Freeze</FormLabel>*/}
                            {/*                <RadioGroup row {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>*/}
                            {/*                    <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Allowed" />*/}
                            {/*                    <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="Not allowed" />*/}
                            {/*                </RadioGroup>*/}
                            {/*                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}*/}
                            {/*            </FormControl>*/}
                            {/*        )}*/}
                            {/*    />*/}
                            {/*</Box>*/}
                            {/*<Box sx={{mb:2}}>*/}
                            {/*    <Controller name="hasEndDate" control={control}*/}
                            {/*        rules={{*/}
                            {/*            validate: (value) => {*/}
                            {/*                if (value === '' || value === null){*/}
                            {/*                    return "Finite is required";*/}
                            {/*                }*/}
                            {/*                return true;*/}
                            {/*            }*/}
                            {/*        }}*/}
                            {/*        render={({ field, fieldState: { error } }) => (*/}
                            {/*            <FormControl error={!!error}>*/}
                            {/*                <FormLabel>Finite</FormLabel>*/}
                            {/*                <RadioGroup row {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>*/}
                            {/*                    <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Yes" />*/}
                            {/*                    <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="No" />*/}
                            {/*                </RadioGroup>*/}
                            {/*                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}*/}
                            {/*            </FormControl>*/}
                            {/*        )}*/}
                            {/*    />*/}
                            {/*</Box>*/}
                            {/*<Box sx={{mb:2}}>*/}
                            {/*    <Controller name="type" control={control}*/}
                            {/*        rules={{*/}
                            {/*            validate: (value) => {*/}
                            {/*                if (value === '' || value === null){*/}
                            {/*                    return "Billing method is required";*/}
                            {/*                }*/}
                            {/*                return true;*/}
                            {/*            }*/}
                            {/*        }}*/}
                            {/*        render={({ field, fieldState: { error } }) => (*/}
                            {/*            <FormControl error={!!error}>*/}
                            {/*                <FormLabel>Billing Method</FormLabel>*/}
                            {/*                <RadioGroup row {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>*/}
                            {/*                    <FormControlLabel value={PAYMENT_TYPE.SINGLE} control={<Radio checked={field.value === PAYMENT_TYPE.SINGLE}/>} label="Prepaid" />*/}
                            {/*                    <FormControlLabel value={PAYMENT_TYPE.RECURRING} control={<Radio checked={field.value === PAYMENT_TYPE.RECURRING}/>} label="Subscription" />*/}
                            {/*                </RadioGroup>*/}
                            {/*                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}*/}
                            {/*            </FormControl>*/}
                            {/*        )}*/}
                            {/*    />*/}
                            {/*</Box>*/}
                            {/*{*/}
                            {/*    type === PAYMENT_TYPE.RECURRING ?*/}
                            {/*        <Box sx={{mb:2}}>*/}
                            {/*            <Controller name="chargeOnFirst" control={control}*/}
                            {/*                rules={{*/}
                            {/*                    validate: (value) => {*/}
                            {/*                        if (type === PAYMENT_TYPE.RECURRING && (value === '' || value === null)){*/}
                            {/*                            return "Charge on 1st is required";*/}
                            {/*                        }*/}
                            {/*                        return true;*/}
                            {/*                    }*/}
                            {/*                }}*/}
                            {/*                render={({ field, fieldState: { error } }) => (*/}
                            {/*                    <FormControl error={!!error}>*/}
                            {/*                        <FormLabel>Charge on 1<Typography component="sup" sx={{ fontSize: '0.75em' }}>st</Typography></FormLabel>*/}
                            {/*                        <RadioGroup row {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>*/}
                            {/*                            <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Enable" />*/}
                            {/*                            <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="Disable" />*/}
                            {/*                        </RadioGroup>*/}
                            {/*                        {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}*/}
                            {/*                    </FormControl>*/}
                            {/*                )}*/}
                            {/*            />*/}
                            {/*        </Box>*/}
                            {/*    :<></>*/}
                            {/*}*/}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    )
}

export default PaymentPlanForm
