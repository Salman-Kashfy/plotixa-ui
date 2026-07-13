import {Fragment, useContext, useEffect, useState} from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    RadioGroup,
    Radio,
    FormLabel,
    FormControlLabel,
    FormHelperText,
    InputLabel, Select, MenuItem, Checkbox
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DISCOUNT_ON, DISCOUNT_TYPE, GLOBAL_STATUSES, ROLE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {decimalOnly} from "../../utils/validations";
import {GetBrands} from "../../services/brand.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthBrand} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {startCase,toLower} from "lodash";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function DiscountForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const adminContext = useContext(AdminContext)
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        name: '',
        brand: {},
        discountOn: '',
        discountType: '',
        brandId: brandSelection ? '' : getAuthBrand(),
        startDate: '',
        endDate: '',
        percentage: '',
        fixedAmount: '',
        forMembers: null,
        forNonMembers: null,
        maxLimit: '',
        status: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, setError, clearErrors, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const brand = watch('brand')
    const discountType = watch('discountType')
    const forMembers = watch('forMembers')
    const forNonMembers = watch('forNonMembers')

    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection){
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const fetchBrands = () => {
        setBrandLoader(true)
        GetBrands({limit:0}).then(({list}:any) => {
            setBrands(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setBrandLoader(false)
        }).catch((e) => {
            setBrandLoader(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        if(!forMembers && !forNonMembers){
            setError("forNonMembers", { type: "manual", message: "Select at least one option" })
            return
        }else{
            clearErrors("forNonMembers")
        }

        delete data.brand
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'maxLimit':
                case 'percentage':
                case 'fixedAmount':
                    data[key] = parseFloat(data[key]);
                    break
                case 'forMembers':
                case 'forNonMembers':
                    data[key] = data[key] === true || (typeof data[key] === "string" && data[key] === "true");
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    useEffect(() => {
        if(brandSelection){
            fetchBrands()
        }
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    useEffect(() => {
        if(brands.length && !isEmpty(record)){
            const brand = brands.find((e) => e.value === record.brandId)
            if(brand){
                setBrandId({label: brand.label, value: brand.value})
            }
        }
    }, [record, brands]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Discount Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="name" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Name is required"
                                            },
                                            maxLength: {
                                                value: 25,
                                                message: "Name must not exceed 25 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Name'}/>
                                        )}
                                    />
                                </Grid>
                                {
                                    brandSelection ?
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Controller name="brandId" control={control}
                                                rules={{
                                                    required: {
                                                        value: "required",
                                                        message: "Brand is required"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <Autocomplete
                                                        id="brands-dd"
                                                        options={brands}
                                                        getOptionLabel={(option) => option.label || ''}
                                                        value={brandId}
                                                        loading={brandLoader}
                                                        onChange={handleBrandChange}
                                                        renderInput={(params) => <FormInput fullWidth={true} disabled={!brands.length} error={error} label={'Brand'} params={params}
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
                                                )}
                                            />
                                        </Grid>
                                    : <></>
                                }
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="discountOn" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Discount on is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true}>
                                                <InputLabel>Discount On</InputLabel>
                                                <Select label="Discount On" onChange={(e) => field.onChange(e.target.value)} value={field.value || ''}>
                                                    { Object.keys(DISCOUNT_ON).map((key:string) => {
                                                        return (<MenuItem selected={field.value === key} value={key} key={key}>{DISCOUNT_ON[key]}</MenuItem>)
                                                    }) }
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="startDate" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Start date"
                                                    closeOnSelect={true}
                                                    value={field.value ? dayjs(field.value) : null}
                                                    format="MMM DD, YYYY"
                                                    onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'standard',
                                                            sx:{width:'100%'},
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="endDate" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="End date"
                                                    closeOnSelect={true}
                                                    value={field.value ? dayjs(field.value) : null}
                                                    format="MMM DD, YYYY"
                                                    onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'standard',
                                                            sx:{width:'100%'},
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="status" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Status is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                <InputLabel>Status</InputLabel>
                                                <Select label="Status" {...field} value={field.value || ''} error={!!error}>
                                                    { Object.keys(GLOBAL_STATUSES).map((_status) => {
                                                        return (<MenuItem value={_status} key={_status}>{_status}</MenuItem>)
                                                    }) }
                                                </Select>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                        <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>{btnLabel}</LoadingButton>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} order={{ xs: 1, md: 2 }}>
                    <Card sx={{mb:2}}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{mb:2}}>Discount Options</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="forMembers" control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormControlLabel control={<Checkbox checked={field.value === true || field.value === 'true'}/>} label="Target Members"
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                                <Controller name="forNonMembers" control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormControlLabel control={<Checkbox checked={field.value === true || field.value === 'true'}/>} label="Target Non Members"
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="discountType" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Discount type is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Discount type</FormLabel>
                                            <RadioGroup
                                                row
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(event) => field.onChange(event.target.value)}
                                                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                                            >
                                                <FormControlLabel value={DISCOUNT_TYPE.PERCENTAGE} control={<Radio checked={field.value === DISCOUNT_TYPE.PERCENTAGE}/>} label={startCase(toLower(DISCOUNT_TYPE.PERCENTAGE))} />
                                                <FormControlLabel value={DISCOUNT_TYPE.FIXED} control={<Radio checked={field.value === DISCOUNT_TYPE.FIXED}/>} label={startCase(toLower(DISCOUNT_TYPE.FIXED))} />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            { discountType === DISCOUNT_TYPE.PERCENTAGE ?
                                <>
                                    <Box sx={{mb:2}}>
                                        <Controller name="percentage" control={control}
                                            rules={{
                                                validate: (value) => {
                                                    if (discountType === DISCOUNT_TYPE.PERCENTAGE){
                                                        if(!value){
                                                            return "Percentage is required";
                                                        }
                                                        if(parseFloat(value) > 100){
                                                            return "Percentage must not exceed 100.";
                                                        }
                                                    }
                                                    return true;
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Percentage (%)'} onInput={decimalOnly}/>
                                            )}
                                        />
                                    </Box>
                                    <Box sx={{mb:2}}>
                                        <Controller name="maxLimit" control={control}
                                            rules={{
                                                validate: (value) => {
                                                    if (discountType === DISCOUNT_TYPE.PERCENTAGE && !value){
                                                        return "Discount Cap is required";
                                                    }
                                                    return true;
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Discount Cap ' + (!isEmpty(brand) ? `(${brand.country.currency.symbol})` : '' )} onInput={decimalOnly}/>
                                            )}
                                        />
                                    </Box>
                                </>
                                :<></>
                            }
                            { discountType === DISCOUNT_TYPE.FIXED ?
                                <Box sx={{mb:2}}>
                                    <Controller name="fixedAmount" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (discountType === DISCOUNT_TYPE.FIXED && !value){
                                                    return "Discount amount is required";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Discount Amount ' + (!isEmpty(brand) ? `(${brand.country.currency.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Box>
                                :<></>
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    )
}

export default DiscountForm
