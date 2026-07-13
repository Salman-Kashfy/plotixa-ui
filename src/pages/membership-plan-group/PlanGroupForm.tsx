import {Fragment, useContext, useEffect, useState} from 'react'
import {Box, Card, CardContent, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {ROLE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {getAuthBrand} from "../../utils/permissions";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {GetBrands} from "../../services/brand.service";
import Autocomplete from "@mui/material/Autocomplete";
import {AdminContext} from "../../hooks/AdminContext";
import FormInput from '../../components/FormInput';
import CircularProgress from "@mui/material/CircularProgress";

function PlanGroupForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const adminContext = useContext(AdminContext)
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        name: '',
        brandId: brandSelection ? '' : getAuthBrand(),
        description: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const handleBrandChange = (event: any, value: { value: string, label: string, countryId: string } | null) => {
        if(brandSelection){
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const fetchBrands = () => {
        setBrandLoader(true)
        GetBrands({limit:0}).then(({list}:any) => {
            const brands = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setBrands(brands)
            setBrandLoader(false)
        }).catch((e) => {
            console.log(e.message)
            setBrandLoader(false)
        })
    }

    const onSubmit = async (data) => {
        delete data?.gym
        delete data?.brand
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            if(key === 'id' && !data[key]){
                continue
            }
            _data[key] = data[key]
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
                <Grid size={12}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Plan Group Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                    <Controller name="description" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 50,
                                                message: "Description must not exceed 50 characters"
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
            </Grid>
        </form>
    )
}

export default PlanGroupForm