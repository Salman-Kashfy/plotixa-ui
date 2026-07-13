import {Fragment, useContext, useEffect, useState} from 'react'
import {Box, Card, CardContent, Typography, Autocomplete } from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from "@mui/lab/LoadingButton";
import {useForm,Controller} from "react-hook-form";
import {GetCountries} from "../../services/country.service";
import ProgressBar from "../../components/ProgressBar";
import {ToastContext} from "../../hooks/ToastContext";
import UploadImage from "../../components/UploadImage";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {numberOnly} from "../../utils/validations";
import {constants} from "../../utils/constants";

function BrandForm({data = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const [preview, setPreview] = useState('');
    const toastContext:any = useContext(ToastContext)
    const [countries, setCountries] = useState([]);
    const [countryId, setCountryId] = useState([]);
    const [countryLoader, setCountryLoader] = useState(false);
    const defaultValues = {
        id: '',
        name: '',
        logo: '',
        legalName: '',
        email: '',
        countryId: '',
        phoneCode: '',
        phoneNumber: '',
    }
    const {control, handleSubmit, formState: {errors}, setValue, watch, reset} = useForm({
        mode: "onChange",
        defaultValues: Object.keys(data).length === 0 ? defaultValues : data
    })

    const logo = watch('logo')
    const uploadCallback = (value:string) => {
        setValue('logo', value)
    }

    const handleCountryChange = (event: any, value: { value: string, label: string } | null) => {
        if(value?.value != null){
            setValue('countryId', value.value)
            setCountryId({label: value.label, value: value.value})
            if(create){
                setValue('phoneCode', value.phoneCode)
            }
        }
    }

    const onSubmit = async (data) => {
        const _data:any = {}
        for (const key of Object.keys(defaultValues)) {
            if(key === 'id' && !data[key]){
                continue
            }
            _data[key] = data[key]
        }
        if(!_data?.logo){
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Brand logo is required.')
            toastContext.setToast(true)
            return
        }
        callback(_data)
    };

    useEffect(() => {
        setCountryLoader(true)
        GetCountries({supported:true}).then((response:any) => {
            setCountries(
                response.map((e: any) => {
                    return { value: e.id, label: e.name, phoneCode: e.phoneCode };
                })
            );
            setCountryLoader(false)
        }).catch((e:any) => {
            setCountryLoader(false)
            console.log('Error on fetching brand countries: ',e)
        })
    }, []);

    useEffect(() => {
        if (Object.values(data).length && countries.length && data.countryId ) {
            const country = countries.find((e) => e.value === data.countryId)
            reset(data);
            setCountryId({label: country.label, value: country.value})
            if(data.imageUrl){
                setPreview(data.imageUrl)
            }
        }
    }, [data, reset, countries]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Brand Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="name" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Brand name is required"
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: "Brand name must not be greater than 50 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Brand Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="legalName" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Legal name is required"
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: "Legal name must not be greater than 50 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Legal Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="email" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Brand email is required"
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: "Brand email must not be greater than 100 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Brand Email'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="countryId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Country is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="countries"
                                                options={countries}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={countryId}
                                                onChange={handleCountryChange}
                                                loading={countryLoader}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!countries.length} error={error} label={'Country'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {countryLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                                                    message: "Phone code must not be greater than 4 characters."
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
                                                    message: "Phone number must not be greater than 15 characters."
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
                    <UploadImage id={'upload-brand-logo'} title={'Upload Logo'} alt={'Upload Brand Logo'} callback={uploadCallback} preview={preview || logo} setPreview={setPreview} />
                </Grid>
            </Grid>
        </form>
    )
}

export default BrandForm
