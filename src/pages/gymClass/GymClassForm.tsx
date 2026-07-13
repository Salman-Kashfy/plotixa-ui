import {Fragment, useContext, useEffect, useState} from 'react'
import {Box, Card, CardContent, Typography, FormControl, RadioGroup, Radio, FormLabel, FormControlLabel, FormHelperText} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {ROLE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {isValidURL} from "../../utils/validations";
import {GetBrands} from "../../services/brand.service";
import {GetGymClassCategories} from "../../services/class.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthBrand} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";

function GymClassForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const adminContext = useContext(AdminContext)
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [gymClassCategoryId, setGymClassCategoryId] = useState({});
    const [gymClassCategories, setGymClassCategories] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        name: '',
        brandId: brandSelection ? '' : getAuthBrand(),
        classType: '',
        onlineLink: '',
        description: '',
        gymClassCategoryId: ''
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const classType = watch('classType')
    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection){
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const handleGymClassCategoryChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymClassCategoryId', value?.value)
        setGymClassCategoryId({label: value?.label, value: value?.value})
        setValue('gymClassCategoryIds', [value?.value])
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

    const fetchGymClassCategories = () => {
        setCategoryLoader(true)
        GetGymClassCategories().then(({list}:any) => {
            setGymClassCategories(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setCategoryLoader(false)
        }).catch((e) => {
            setCategoryLoader(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
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
        fetchGymClassCategories()
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
        if(gymClassCategories.length && !isEmpty(record)){
            const gymClassCategory = gymClassCategories.find((e) => e.value === record.gymClassCategoryId)
            if(gymClassCategory){
                setGymClassCategoryId({label: gymClassCategory.label, value: gymClassCategory.value})
            }
        }
    }, [record, gymClassCategories]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Class Details</Typography>
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
                                    <Controller name="gymClassCategoryId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Category is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="gym-class-category-dd"
                                                options={gymClassCategories}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={gymClassCategoryId}
                                                loading={categoryLoader}
                                                onChange={handleGymClassCategoryChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!gymClassCategories.length} error={error} label={'Category'} params={params}
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
                                <Grid size={{ xs: 12 }}>
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
                        <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>{btnLabel}</LoadingButton>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} order={{ xs: 1, md: 2 }}>
                    <Card sx={{mb:2}}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{mb:2}}>Class Options</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="classType" control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Class type is required",
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Class type</FormLabel>
                                            <RadioGroup
                                                row
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(event) => field.onChange(event.target.value)}
                                                sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                                            >
                                                <FormControlLabel value={'ONSITE'} control={<Radio />} label="Onsite" />
                                                <FormControlLabel value={'ONLINE'} control={<Radio />} label="Online" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{display: ['ONSITE',''].includes(classType) ? 'none' : undefined}}>
                                <Controller name="onlineLink" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (!value && classType === 'ONLINE' ){
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

export default GymClassForm
