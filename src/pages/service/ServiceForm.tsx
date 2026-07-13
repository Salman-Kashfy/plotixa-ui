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
    Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {ROLE, SERVICE_TYPE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {decimalOnly, isValidURL, numberOnly} from "../../utils/validations";
import {GetBrands} from "../../services/brand.service";
import {GetServiceCategories} from "../../services/service.category.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthBrand} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from '@mui/icons-material/Error';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import EmojiObjectsTwoToneIcon from '@mui/icons-material/EmojiObjectsTwoTone';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import FlareRoundedIcon from '@mui/icons-material/FlareRounded';
import { yellow } from '@mui/material/colors';

function ServiceForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const adminContext = useContext(AdminContext)
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [serviceCategoryId, setServiceCategoryId] = useState({});
    const [serviceCategories, setServiceCategories] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        name: '',
        brand: {},
        brandId: brandSelection ? '' : getAuthBrand(),
        isBookable: null,
        commissionable: null,
        onlineLink: '',
        serviceType: '',
        servicePack: null,
        description: '',
        groupNumber: '',
        totalSessions: '',
        totalCost: '',
        sessionDuration: '',
        serviceValidity: '',
        sessionSiteType: '',
        packageFeatures: ['','',''],
        serviceCategoryId: '',
        serviceCategoryIds: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const brand = watch('brand')
    const serviceType = watch('serviceType')
    const sessionSiteType = watch('sessionSiteType')
    const radioGroupSx = {
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 0, sm: 1 },
    };

    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection){
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const handleServiceCategoryChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('serviceCategoryId', value?.value)
        setServiceCategoryId({label: value?.label, value: value?.value})
        setValue('serviceCategoryIds', [value?.value])
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

    const fetchServiceCategories = () => {
        setCategoryLoader(true)
        GetServiceCategories().then(({list}:any) => {
            setServiceCategories(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setCategoryLoader(false)
        }).catch((e) => {
            setCategoryLoader(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        delete data?.brand
        delete data?.serviceCategoryId
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'groupNumber':
                case 'totalSessions':
                case 'sessionDuration':
                case 'serviceValidity':
                case 'totalCost':
                    data[key] = Number(data[key])
                    break
                case 'isBookable':
                case 'commissionable':
                case 'servicePack':
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
        fetchServiceCategories()
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

    useEffect(() => {
        if(serviceCategories.length && !isEmpty(record)){
            const serviceCategory = serviceCategories.find((e) => e.value === record.serviceCategoryId)
            if(serviceCategory){
                setServiceCategoryId({label: serviceCategory.label, value: serviceCategory.value})
            }
        }
    }, [record, serviceCategories]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Service Details</Typography>
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
                                    <Controller name="totalSessions" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Total Sessions is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Session Count'} onInput={(e) => numberOnly(e,3)}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="totalCost" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Total cost is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Total Cost ' + (!isEmpty(brand) ? `(${brand.country.currency.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="sessionDuration" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Sessions duration is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Sessions Duration (In mins)'} onInput={(e) => numberOnly(e,3)}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="serviceValidity" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Service validity is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Service Validity (In days)'} onInput={(e) => numberOnly(e,3)}/>
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
                                    <Controller name="serviceCategoryId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Service Category is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="service-category-dd"
                                                options={serviceCategories}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={serviceCategoryId}
                                                loading={categoryLoader}
                                                onChange={handleServiceCategoryChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!serviceCategories.length} error={error} label={'Service Category'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {categoryLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                    <Card sx={{ mb: 2 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Service Options</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="isBookable" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Booking status is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Booking Status</FormLabel>
                                            <RadioGroup sx={radioGroupSx} {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Open" />
                                                <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="Close" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="commissionable" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Commission status is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Commissionable <Tooltip title="Disabling this prevents new assignments. To stop rewarding commissions, unassign it from instructor contract commissions"><FlareRoundedIcon style={{fontSize: 24, verticalAlign:'sub', color:yellow[800]}}/></Tooltip></FormLabel>
                                            <RadioGroup sx={radioGroupSx} {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Yes" />
                                                <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="No" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="servicePack" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Service pack is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Service Pack <Tooltip title="Disabling this prevents new assignments. To stop, unassign service packs from payment plans"><FlareRoundedIcon style={{fontSize: 24, verticalAlign:'sub', color:yellow[800]}}/></Tooltip></FormLabel>
                                            <RadioGroup sx={radioGroupSx} {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Yes" />
                                                <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="No" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="serviceType" control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Service type is required",
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Service Type</FormLabel>
                                            <RadioGroup sx={radioGroupSx} {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                <FormControlLabel value={SERVICE_TYPE.SINGLE_SESSION} control={<Radio />} label="Single"/>
                                                <FormControlLabel value={SERVICE_TYPE.GROUP_SESSION} control={<Radio />} label="Group"/>
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            {
                                serviceType && serviceType === SERVICE_TYPE.GROUP_SESSION ?
                                    <Box sx={{mb:2}}>
                                        <Controller name="groupNumber" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Batch size is required"
                                                },
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Batch Size'} onInput={numberOnly}/>
                                            )}
                                        />
                                    </Box>
                                :<></>
                            }
                            <Box sx={{mb:2}}>
                                <Controller name="sessionSiteType" control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Site site is required",
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Session Site</FormLabel>
                                            <RadioGroup sx={radioGroupSx} {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                <FormControlLabel value={'ONSITE'} control={<Radio />} label="Onsite" />
                                                <FormControlLabel value={'ONLINE'} control={<Radio />} label="Online" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{display: ['ONSITE',''].includes(sessionSiteType) ? 'none' : undefined}}>
                                <Controller name="onlineLink" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (!value && sessionSiteType === 'ONLINE' ){
                                                return "Web URL is required";
                                            }
                                            if(value && !isValidURL(value)){
                                                return "Invalid URL";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput field={field} value={field.value || ''} error={error} label={'Web URL'} fullWidth={true}/>
                                    )}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    )
}

export default ServiceForm
