import {Fragment, useContext, useEffect, useState} from 'react'
import {
    InputLabel,
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    MenuItem,
    FormHelperText,
    Button,
    IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {isEmpty} from "lodash";
import Select from '@mui/material/Select';
import {GENDERS, ROLE, GLOBAL_STATUSES, GENDER_NAMES} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import FormInput from "../../components/FormInput";
import {numberOnly,isValidEmail} from "../../utils/validations";
import {getAuthGym} from "../../utils/permissions";
import {AdminContext} from "../../hooks/AdminContext";
import ProgressBar from "../../components/ProgressBar";
import {GetGyms} from "../../services/gym.service";
import {GetCountries} from "../../services/country.service";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingButton from "@mui/lab/LoadingButton";
import {startCase,toLower} from "lodash";
import InputAdornment from "@mui/material/InputAdornment";
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SyncIcon from "@mui/icons-material/Sync";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Alert from '@mui/material/Alert';
import { isElectron } from "../../utils/electron";
import ImageCaptureEditor from "../../components/ImageCaptureEditor";

interface Country {
    value: string;
    label: string;
    phoneCode?: string;
}

interface Gym {
    value: string;
    label: string;
}

function CustomerForm({record = {}, callback, btnLabel, loading, syncLoading, syncBiometric, enrollBiometric, unsyncBiometric, formLoader = false, create = false}:any) {
    const adminContext = useContext(AdminContext) as any
    const [countries, setCountries] = useState<Country[]>([]);
    const [countryId, setCountryId] = useState<Country | null>(null);
    const [gymId, setGymId] = useState<Gym | null>(null);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [countryLoader, setCountryLoader] = useState(false);
    const [preview, setPreview] = useState('');
    const [imageRemoved, setImageRemoved] = useState(false);
    const maxChildAccounts = 3
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext?.admin?.role?.name?.toLowerCase());
    const defaultValues = {
        id: '',
        firstName: '',
        lastName: '',
        gender: '',
        gymId: gymSelection ? '' : getAuthGym(),
        email: '',
        dob: '',
        address: '',
        phoneCode: '',
        phoneNumber: '',
        isParent: null,
        countryId: '',
        biometricUserId: '',
        linkedCustomers: [] as any[],
        status: create ? GLOBAL_STATUSES.ACTIVE : '',
        photo: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const linkedCustomers = watch('linkedCustomers')
    const initializeForm = (data: any) => {
        const _data: any = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    const photo = watch('photo')
    const uploadCallback = (value: string) => {
        setValue('photo', value)
        // ImageCaptureEditor will call setPreview with the blob URL when upload completes
        // If value is empty, image was explicitly removed by user
        if(!value) {
            setImageRemoved(true)
            setPreview('')
        } else {
            // New image uploaded, reset the removed flag
            setImageRemoved(false)
        }
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            // Reset imageRemoved flag when new record is loaded
            setImageRemoved(false)
            // Use imageUrl for preview when loading existing record (server image)
            // Only set preview if:
            // 1. There's no new upload (photo field is empty)
            // 2. Image was not explicitly removed by user
            // This ensures we show the server image, but don't override new upload previews or removals
            if(!photo && !imageRemoved && record.imageUrl) {
                setPreview(record.imageUrl)
            } else if(!photo && !imageRemoved && !record.imageUrl) {
                setPreview('')
            }
            // If photo field has value (new upload), ImageCaptureEditor manages preview via setPreview
            // If imageRemoved is true, don't show imageUrl even if it exists
        } else {
            // For new records, reset removed flag and clear preview if no new upload
            setImageRemoved(false)
            if(!photo) {
                setPreview('')
            }
        }
    }, [record]);

    const handleGymChange = (event: any, value: Gym | null) => {
        setValue('gymId', value?.value || '')
        setGymId(value)
    }

    const handleCountryChange = (event: any, value: Country | null) => {
        if(value?.value != null){
            setValue('countryId', value.value)
            setCountryId(value)
            if(create){
                setValue('phoneCode', value.phoneCode || '')
            }
        }
    }

    const addAccount = () => {
        if(linkedCustomers?.length>=maxChildAccounts) return
        setValue('linkedCustomers', [...linkedCustomers,{
            firstName: '',
            lastName: '',
            dob: '',
            phoneCode: '',
            phoneNumber: '',
        }])
    }

    const removeAccount = (index: number) => {
        setValue('linkedCustomers', linkedCustomers.filter((e: any, i: number) => {
            if(index!==i){
                return e
            }
        }))
    }

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0}).then(({list}: any) => {
            setGyms(list.map((e: any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((_e: any) => {
            setGymLoader(false)
            // Handle error silently or show user-friendly message
        })
    }

    const fetchCountries = () => {
        setCountryLoader(true)
        GetCountries().then((response: any) => {
            setCountries(
                response.map((e: any) => {
                    return { value: e.id, label: e.name, phoneCode: e.phoneCode };
                })
            );
            setCountryLoader(false)
        }).catch((_e: any) => {
            setCountryLoader(false)
            // Handle error silently or show user-friendly message
        })
    }

    

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
        fetchCountries()
    }, [])

    const onSubmit = async (data: any) => {
        const _data: any = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'gymId':
                    if(!create) continue
                    break
                case 'isParent':
                    continue
                case 'linkedCustomers':
                    data[key] = data[key].map((e: any) => {
                        delete e.fullName
                        return e
                    })
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    useEffect(() => {
        if(gyms.length && !isEmpty(record)){
            const gym = gyms.find((e: Gym) => e.value === record.gymId)
            if(gym){
                setGymId(gym)
            }
        }
    }, [record, gyms]);

    useEffect(() => {
        if(countries.length && !isEmpty(record.countryId)){
            const country = countries.find((e: Country) => e.value === (record?.countryId))
            if(country){
                setCountryId(country)
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
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Customer Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                                validate: (value) => {
                                                    if ((create || record?.isParent) && isEmpty(value)) {
                                                        return "Phone code is required";
                                                    }
                                                    if ((create || record?.isParent) && value.length > 4) {
                                                        return "Phone code must not exceed 4 characters.";
                                                    }
                                                    return true;
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput
                                                    fullWidth={true}
                                                    error={error}
                                                    field={field}
                                                    value={field.value || ''}
                                                    label={'Phone Code'}
                                                    sx={{ width: { xs: '100%', sm: 90 }, flexShrink: 0 }}
                                                    onInput={(e: any) => numberOnly(e, 4)}
                                                />
                                            )}
                                        />
                                        <Controller name="phoneNumber" control={control}
                                            rules={{
                                                validate: (value) => {
                                                    if ((create || record?.isParent) && isEmpty(value)) {
                                                        return "Phone number is required";
                                                    }
                                                    if ((create || record?.isParent) && value.length > 15) {
                                                        return "Phone number must not exceed 15 characters.";
                                                    }
                                                    return true;
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput
                                                    fullWidth={true}
                                                    error={error}
                                                    field={field}
                                                    value={field.value || ''}
                                                    label={'Phone Number'}
                                                    sx={{ flex: 1, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}
                                                    onInput={(e: any) => numberOnly(e, 15)}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>
                                {
                                    gymSelection ?
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                                        disabled={!create}
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="email" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 100,
                                                message: "Instructor email must not exceed 100 characters."
                                            },
                                            validate: (value) => {
                                                if(!isEmpty(value)){
                                                    if(value.length>100){
                                                        return "Instructor email must not exceed 100 characters."
                                                    }else if(!isValidEmail(value)){
                                                        return "Invalid email format."
                                                    }
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput field={field} value={field.value || ''} error={error} label={'Email'} fullWidth={true}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="dob" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Date of Birth"
                                                    closeOnSelect={true}
                                                    value={field.value ? dayjs(field.value) : null}
                                                    format="MMM DD, YYYY"
                                                    maxDate={dayjs()}
                                                    onChange={(event) => event && field.onChange(event.format('YYYY-MM-DD'))}
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="address" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 200,
                                                message: "Address must not be greater than 200 characters"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Address'}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="biometricUserId" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Biometric User ID'} InputProps={{
                                                startAdornment: <InputAdornment position="start"><FingerprintIcon/></InputAdornment>,
                                            }}/>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    {
                        create || record?.isParent ?
                            <Card>
                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Child Account(s)</Typography>
                                    { linkedCustomers?.length ?
                                        <>
                                            { linkedCustomers.map((e, index) => {
                                                return (
                                                    <Box key={e.id || index} sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" color={'primary'} gutterBottom sx={{mb:2}}>Account {index+1}</Typography>
                                                        <Grid container spacing={3}>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedCustomers[${index}].firstName`} control={control}
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
                                                                        <FormInput fullWidth={true} error={error} field={field} value={linkedCustomers[index].firstName || ''} label={'First Name'}/>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedCustomers[${index}].lastName`} control={control}
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
                                                                        <FormInput fullWidth={true} error={error} field={field} value={linkedCustomers[index].lastName || ''} label={'Last Name'}/>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedCustomers[${index}].gender`} control={control}
                                                                    rules={{
                                                                        required: {
                                                                            value: "required",
                                                                            message: "Gender is required"
                                                                        },
                                                                    }}
                                                                    render={({ field, fieldState: { error } }) => (
                                                                        <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                                            <InputLabel>Gender</InputLabel>
                                                                            <Select label="Gender" {...field} value={linkedCustomers[index].gender || ''} error={!!error}>
                                                                                { Object.keys(GENDERS).map((key:string) => {
                                                                                    return (<MenuItem value={key} key={key}>{startCase(toLower(key.replace(/_/g,' ')))}</MenuItem>)
                                                                                }) }
                                                                            </Select>
                                                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                                        </FormControl>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                                                                <Controller name={`linkedCustomers[${index}].dob`} control={control}
                                                                    rules={{
                                                                        required: {
                                                                            value: "required",
                                                                            message: "Date of Birth is required"
                                                                        },
                                                                    }}
                                                                    render={({ field, fieldState: { error } }) => (
                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                            <DatePicker
                                                                                label="Date of Birth"
                                                                                closeOnSelect={true}
                                                                                value={linkedCustomers[index].dob ? dayjs(linkedCustomers[index].dob) : null}
                                                                                format="MMM DD, YYYY"
                                                                                maxDate={dayjs()}
                                                                                onChange={(event) => event && field.onChange(event.format('YYYY-MM-DD'))}
                                                                                slotProps={{
                                                                                    textField: {
                                                                                        variant: 'standard',
                                                                                        sx:{width:'100%'},
                                                                                        error: !!error,
                                                                                        helperText: error?.message,
                                                                                    },
                                                                                }}
                                                                            />
                                                                        </LocalizationProvider>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, lg: 3 }}>
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        flexDirection: { xs: 'column', sm: 'row' },
                                                                        gap: 1,
                                                                        alignItems: { xs: 'stretch', sm: 'flex-start' },
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            flex: 1,
                                                                            flexDirection: { xs: 'column', sm: 'row' },
                                                                            gap: 1,
                                                                            minWidth: 0,
                                                                        }}
                                                                    >
                                                                        <Controller name={`linkedCustomers[${index}].phoneCode`} control={control}
                                                                            rules={{
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
                                                                                    value={linkedCustomers[index]?.phoneCode || ''}
                                                                                    label={'Ph. Code'}
                                                                                    sx={{ width: { xs: '100%', sm: 90 }, flexShrink: 0 }}
                                                                                    onInput={(e: any) => numberOnly(e, 4)}
                                                                                />
                                                                            )}
                                                                        />
                                                                        <Controller name={`linkedCustomers[${index}].phoneNumber`} control={control}
                                                                            rules={{
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
                                                                                    value={linkedCustomers[index]?.phoneNumber || ''}
                                                                                    label={'Ph. No'}
                                                                                    sx={{ flex: 1, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}
                                                                                    onInput={(e: any) => numberOnly(e, 15)}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <IconButton
                                                                        aria-label="delete"
                                                                        sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' }, mt: { sm: 1 } }}
                                                                        disabled={!!(linkedCustomers[index].id) || false}
                                                                        color={'error'}
                                                                        onClick={() => removeAccount(index)}
                                                                    >
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }) }
                                        </>
                                        :<></>
                                    }
                                    <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                        <Button
                                            onClick={addAccount}
                                            disabled={linkedCustomers?.length >= maxChildAccounts}
                                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                                        >
                                            Add Account
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        :
                        <></>
                    }
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
                    <ImageCaptureEditor
                                id={'upload-customer-photo'}
                                title={'Upload Photo'}
                                alt={'Customer Photo'}
                                callback={uploadCallback}
                                preview={
                                    // Priority: 1. New upload preview (managed by ImageCaptureEditor via setPreview)
                                    // 2. imageUrl from record (for existing server images, only if not removed)
                                    // 3. Empty string
                                    preview || 
                                    (!photo && !imageRemoved && record?.imageUrl ? record.imageUrl : '') || 
                                    ''
                                }
                                setPreview={setPreview}
                            />
                    </Card>
                            
                    { isElectron() && !create && (<Card>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Sync Biometric</Typography>
                            {!formLoader && !record.gym?.deviceIp && (
                                <Alert severity="warning" sx={{mb: 2}}>Setup device IP</Alert>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                { !record.biometricUserId ? (
                                    <LoadingButton 
                                        onClick={syncBiometric} 
                                        variant="contained" 
                                        color="secondary" 
                                        disabled={syncLoading || !record.gym?.deviceIp} 
                                        startIcon={<SyncIcon />} 
                                        loading={syncLoading}
                                        fullWidth
                                    >
                                        Sync User
                                    </LoadingButton>
                                ) : (
                                    <>
                                        <LoadingButton 
                                            onClick={enrollBiometric} 
                                            variant="contained" 
                                            color="primary" 
                                            disabled={syncLoading} 
                                            startIcon={<FingerprintIcon />} 
                                            loading={syncLoading}
                                            fullWidth
                                        >
                                            Fingerprint
                                        </LoadingButton>
                                        <LoadingButton 
                                            onClick={unsyncBiometric} 
                                            variant="outlined" 
                                            color="error" 
                                            disabled={syncLoading || !unsyncBiometric} 
                                            startIcon={<LinkOffIcon />} 
                                            loading={syncLoading}
                                            fullWidth
                                        >
                                            Unsync User
                                        </LoadingButton>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>)}
                </Grid>
            </Grid>
        </form>
    )
}

export default CustomerForm
