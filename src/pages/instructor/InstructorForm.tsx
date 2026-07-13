import {Fragment, useContext, useEffect, useState} from 'react'
import {InputLabel, Box, Card, CardContent, Typography, FormControl, MenuItem, FormHelperText} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import {GENDER_NAMES, GENDERS, GLOBAL_STATUSES, ROLE} from "../../utils/constants";
import Autocomplete from '@mui/material/Autocomplete';
import {Controller, useForm} from "react-hook-form";
import {GetGyms} from "../../services/gym.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {GetCountries} from "../../services/country.service";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthGym} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {numberOnly} from "../../utils/validations";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import UploadImage from "../../components/UploadImage";

function InstructorForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const [preview, setPreview] = useState('');
    const [countries, setCountries] = useState([]);
    const [countryId, setCountryId] = useState([]);
    const [gymId, setGymId] = useState({});
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [countryLoader, setCountryLoader] = useState(false);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        photo: '',
        country: {},
        countryId: '',
        phoneCode: '',
        phoneNumber: '',
        email: '',
        gym: {},
        gymId: gymSelection ? '' : getAuthGym(),
        status: '',
        description: ''
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const photo = watch('photo')
    const uploadCallback = (value:string) => {
        setValue('photo', value)
    }

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
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

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        delete data?.gym
        delete data?.brand
        delete data?.country
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

    const fetchCountries = () => {
        setCountryLoader(true)
        GetCountries().then((response:any) => {
            setCountries(
                response.map((e: any) => {
                    return { value: e.id, label: e.name, phoneCode: e.phoneCode };
                })
            );
            setCountryLoader(false)
        }).catch((e:any) => {
            setCountryLoader(false)
            console.log('Error on fetching countries: ',e)
        })
    }

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
        fetchCountries()
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    useEffect(() => {
        if(gyms.length && !isEmpty(record)){
            const gym = gyms.find((e) => e.value === record.gymId)
            if(gym){
                setGymId({label: gym.label, value: gym.value})
            }
        }
    }, [record, gyms]);


    useEffect(() => {
        if(countries.length && !isEmpty(record.countryId)){
            const country = countries.find((e) => e.value === (record?.countryId))
            if(country){
                setCountryId({label: country.label, value: country.value})
            }
        }
    }, [record, countries]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Instructor Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="firstName" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "First name is required"
                                            },
                                            maxLength: {
                                                value: 25,
                                                message: "First name must not exceed 25 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'First Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="lastName" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Last name is required"
                                            },
                                            maxLength: {
                                                value: 25,
                                                message: "Last name must not be greater than 25 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Last Name'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="gender" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Gender is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                <InputLabel>Gender</InputLabel>
                                                <Select label="Gender" {...field} value={field.value || ''} error={!!error}>
                                                    {Object.entries(GENDERS)
                                                        .filter(([_, value]) => value !== GENDERS.ANY) // Exclude "Any" option
                                                        .map(([key, value]) => (
                                                            <MenuItem value={value} key={key}>
                                                                {GENDER_NAMES[value]}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="dob" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Date of Birth"
                                                    closeOnSelect={true}
                                                    value={field.value ? dayjs(field.value) : null}
                                                    format="MMM DD, YYYY"
                                                    maxDate={dayjs()}
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
                                <Grid size={{ xs: 12, sm: 6 }}>
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
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="email" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Instructor email is required"
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: "Instructor email must not exceed 100 characters."
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Email'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                {
                                    gymSelection ?
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Controller name="gymId" control={control}
                                                rules={{
                                                    required: {
                                                        value: "required",
                                                        message: "Gym is required"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <Autocomplete
                                                        id="gyms-dd"
                                                        options={gyms}
                                                        getOptionLabel={(option) => option.label || ''}
                                                        value={gymId}
                                                        loading={gymLoader}
                                                        onChange={handleGymChange}
                                                        renderInput={(params) => <FormInput fullWidth={true} disabled={!gyms.length} error={error} label={'Gym'} params={params}
                                                            slotProps={{
                                                                input: {
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                        <Fragment>
                                                                            {gymLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                    <UploadImage id={'upload-instructor-photo'} title={'Upload Photo'} alt={'Upload Instructor Photo'} callback={uploadCallback} preview={preview || photo} setPreview={setPreview} />
                </Grid>
            </Grid>
        </form>
    )
}

export default InstructorForm
