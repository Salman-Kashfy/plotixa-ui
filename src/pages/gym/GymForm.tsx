import {Fragment, useCallback, useContext, useEffect, useState} from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    FormHelperText,
    FormLabel, RadioGroup, FormControlLabel, Radio, InputAdornment
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {constants, ROLE, TAX_MODE} from "../../utils/constants";
import Autocomplete from '@mui/material/Autocomplete';
import {Controller, useForm} from "react-hook-form";
import {getAuthBrand} from "../../utils/permissions";
import {GetBrands} from "../../services/brand.service";
import {GetCities,GetAuthCities} from "../../services/country.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import UploadImage from "../../components/UploadImage";
import {AdminContext} from "../../hooks/AdminContext";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {numberOnly} from "../../utils/validations";
import {startCase,toLower} from "lodash";
import {debounce} from "@mui/material/utils";
import {isGymPrefixUnique} from "../../services/gym.service";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {ToastContext} from "../../hooks/ToastContext";

function GymForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const [preview, setPreview] = useState('');
    const [cities, setCities] = useState([]);
    const [cityId, setCityId] = useState({});
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const [uniquePrefix, setUniquePrefix] = useState(null);
    const [prefixLoader, setPrefixLoader] = useState(false);
    const [cityLoader, setCityLoader] = useState(false);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        name: '',
        prefix: '',
        email: '',
        brandId: brandSelection ? '' : getAuthBrand(),
        description: '',
        brand: {},
        taxMode: '',
        phoneCode: '',
        phoneNumber: '',
        unitNumber: '',
        logo: '',
        street: '',
        building: '',
        shortAddress: '',
        zipCode: '',
        cityId: '',
        deviceIp: '',
    }

    const {control, handleSubmit, setValue, trigger, setError, clearErrors, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const logo = watch('logo')
    const prefix = watch('prefix')
    const uploadCallback = (value:string) => {
        setValue('logo', value)
    }

    const handleBrandChange = (event: any, value: { value: string, label: string, countryId: string } | null) => {
        if(brandSelection){
            if(isEmpty(brandId)){
                fetchCities(value.countryId)
            }else if(value?.value) {
                const previousBrand = brands.find((e:any) => e.value === brandId?.value)
                if(previousBrand?.countryId !== value?.countryId){
                    setCityId({})
                    setValue('cityId', '')
                    fetchCities(value.countryId)
                }
            }
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const handleCityChange = (event: any, value: { value: string, label: string } | null) => {
        if(value?.value != null){
            setValue('cityId', value.value)
            setCityId({label: value.label, value: value.value})
        }
    }

    const fetchBrands = () => {
        setBrandLoader(true)
        GetBrands({limit:0}).then(({list}:any) => {
            setBrands(list.map((e:any) => {
                return { value: e.id, label: e.name, countryId: e.country.id }
            }))
            setBrandLoader(false)
        }).catch((e) => {
            setBrandLoader(false)
            console.log(e.message)
        })
    }

    const fetchCities = (countryId) => {
        setCityLoader(true)
        GetCities(countryId).then((cities:any) => {
            const rows = cities.map((e: any) => {
                return { value: e.id, label: e.name };
            })
            setCities(rows)
            setCityLoader(false)
        }).catch((e) => {
            setCityLoader(false)
            console.log(e.message)
        })
    }

    const fetchAuthCities = () => {
        setCityLoader(true)
        GetAuthCities().then((cities:any) => {
            const rows = cities.map((e: any) => {
                return { value: e.id, label: e.name };
            })
            setCities(rows)
            setCityLoader(false)
        }).catch((e) => {
            setCityLoader(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        if(!uniquePrefix){
            setError("prefix", { type: "manual", message: "Prefix not validated" }); return
        }
        delete data?.brand
        const _data:any = {}
        for (const key of Object.keys(defaultValues)) {
            if(key === 'id' && !data[key]){
                continue
            }
            _data[key] = data[key]
        }
        if(!_data?.logo){
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Gym logo is required.')
            toastContext.setToast(true)
            return
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = data[key] || ''
        }
        reset(_data)
    }

    const handlePrefix = async (e) => {
        let value = e.target.value;
        if(value && value.length > 1){
            clearErrors('prefix')
        }
        value = value.replace(/[^a-zA-Z]/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
        e.target.value = value.toUpperCase();
    }

    const testDebounce = (prefix,gymId) => {
        if(!prefix.length || prefix.length === 1){
            setPrefixLoader(false)
            return
        }
        isGymPrefixUnique({prefix,gymId}).then((e) => {
            setPrefixLoader(false)
            if(!e.status){
                setUniquePrefix(false)
                setError("prefix", { type: "manual", message: "Prefix already taken" })
            }else{
                clearErrors("prefix")
                setUniquePrefix(true)
            }
        }).catch((e) => {
            setPrefixLoader(false)
        })
    }

    const debouncedFetch = useCallback(
        debounce((prefix,gymId) => testDebounce(prefix,gymId), 950),
        []
    );

    useEffect(() => {
        if (prefix && prefix?.length > 1){
            setPrefixLoader(true)
            debouncedFetch(prefix,record?.id || undefined)
        }
    }, [prefix, debouncedFetch]);

    useEffect(() => {
        if(brandSelection){
            fetchBrands()
        }else{
            fetchAuthCities()
        }
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            fetchCities(record?.brand?.country.id)
            initializeForm(record)
            if(record.imageUrl){
                setPreview(record.imageUrl)
            }
        }
    }, [record]);

    useEffect(() => {
        if(brands.length && !isEmpty(record)){
            const brand = brands.find((e) => e.value === record.brand.id)
            if(brand){
                setBrandId({label: brand.label, value: brand.value})
            }
        }
    }, [record, brands]);

    useEffect(() => {
        if (uniquePrefix === false) {
            trigger("prefix"); // Forces validation to run again
        }
    }, [uniquePrefix, prefixLoader]);

    useEffect(() => {
        if(cities.length && !isEmpty(record.cityId)){
            const city = cities.find((e) => e.value === (record?.cityId))
            if(city){
                setCityId({label: city.label, value: city.value})
            }
        }
    }, [record, cities]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Gym Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="name" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Gym name is required"
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: "Gym name must not exceed 50 characters"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Gym Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="prefix" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Gym prefix is required"
                                            },
                                            minLength: {
                                                value: 2,
                                                message: "Gym prefix must be at least 2 letters."
                                            },
                                            maxLength: {
                                                value: 5,
                                                message: "Gym prefix must not exceed 5 letters"
                                            },
                                            validate: (value) => {
                                                if (value?.length > 1 && !prefixLoader && !uniquePrefix){
                                                    return "Prefix already taken";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Gym Prefix'} onInput={handlePrefix}
                                               InputProps={{
                                                   endAdornment: (
                                                       <InputAdornment position="end">
                                                           {prefixLoader ? (
                                                               <CircularProgress size={20} />
                                                           ) : uniquePrefix && !error ? (
                                                               <TaskAltIcon color="success" />
                                                           ) : null}
                                                       </InputAdornment>
                                                   ),
                                               }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="email" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Gym email is required"
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: "Gym email must not exceed 100 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Gym Email'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 1,
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <Controller name="phoneCode" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Phone code is required"
                                                },
                                                maxLength: {
                                                    value: 4,
                                                    message: "Phone code must not exceed 4 characters."
                                                },
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput
                                                    fullWidth={true}
                                                    error={error}
                                                    field={field}
                                                    value={field.value || ''}
                                                    label={'Phone Code'}
                                                    sx={{ width: { xs: '100%', sm: 90 }, flexShrink: 0 }}
                                                    onInput={(e) => numberOnly(e, 4, false)}
                                                />
                                            )}
                                        />
                                        <Controller name="phoneNumber" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Phone number is required"
                                                },
                                                maxLength: {
                                                    value: 15,
                                                    message: "Phone number must not exceed 15 characters."
                                                },
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput
                                                    fullWidth={true}
                                                    error={error}
                                                    field={field}
                                                    value={field.value || ''}
                                                    label={'Phone Number'}
                                                    sx={{ flex: 1, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}
                                                    onInput={(e) => numberOnly(e, 15, false)}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>
                                {
                                    brandSelection ?
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="deviceIp" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 45,
                                                message: "Device IP must not exceed 45 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Device IP'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <Controller name="description" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 100,
                                                message: "Description must not exceed 100 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Description'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Controller name="taxMode" control={control}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: "Tax mode is required",
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error}>
                                                <FormLabel>Tax mode</FormLabel>
                                                <RadioGroup
                                                    row={false}
                                                    sx={{
                                                        flexDirection: { xs: 'column', sm: 'row' },
                                                        gap: { xs: 0, sm: 1 },
                                                    }}
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                >
                                                    <FormControlLabel value={TAX_MODE.NO_TAXES} control={<Radio />} label={startCase(toLower(TAX_MODE.NO_TAXES)).replace('_',' ')}/>
                                                    <FormControlLabel value={TAX_MODE.INCLUSIVE} control={<Radio />} label={startCase(toLower(TAX_MODE.INCLUSIVE))}/>
                                                    <FormControlLabel value={TAX_MODE.EXCLUSIVE} control={<Radio />} label={startCase(toLower(TAX_MODE.EXCLUSIVE))}/>
                                                </RadioGroup>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Gym Address</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="cityId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "City is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="cities"
                                                options={cities}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={cityId}
                                                loading={cityLoader}
                                                onChange={handleCityChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!cities.length} error={error} label={'City'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {cityLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="unitNumber" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 25,
                                                message: "Unit no must not exceed 25 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Unit Number'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="street" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 60,
                                                message: "Street must not exceed 60 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Street'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="building" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 60,
                                                message: "Building must not exceed 60 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Building'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="shortAddress" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 80,
                                                message: "Short address must not exceed 80 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Short address'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="zipCode" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 25,
                                                message: "Zip code must not exceed 25 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Postal code'} fullWidth={true}/>
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
                            disabled={loading}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            {btnLabel}
                        </LoadingButton>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} order={{ xs: 1, md: 2 }}>
                    <UploadImage id={'upload-gym-logo'} title={'Upload Logo'} alt={'Upload Gym Logo'} callback={uploadCallback} preview={preview || logo} setPreview={setPreview} />
                </Grid>
            </Grid>
        </form>
    )
}

export default GymForm
