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
import {GENDERS, GENDER_NAMES, LEAD_SOURCE, LEAD_TYPE, LEAD_STATUS, ROLE, GLOBAL_STATUSES} from "../../utils/constants";
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingButton from "@mui/lab/LoadingButton";
import {startCase,toLower} from "lodash";

function LeadForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const [countries, setCountries] = useState([]);
    const [countryId, setCountryId] = useState([]);
    const [gymId, setGymId] = useState({});
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [countryLoader, setCountryLoader] = useState(false);
    const maxChildAccounts = 3
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        firstName: '',
        lastName: '',
        gender: '',
        gymId: gymSelection ? '' : getAuthGym(),
        email: '',
        dob: '',
        address: '',
        leadStatus: LEAD_STATUS.HOT,
        leadType: '',
        phoneCode: '',
        phoneNumber: '',
        source: '',
        isParent: null,
        countryId: '',
        linkedAccounts: [],
        status: create ? GLOBAL_STATUSES.ACTIVE : '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const linkedAccounts = watch('linkedAccounts')
    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

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

    const addAccount = () => {
        if(linkedAccounts?.length>=maxChildAccounts) return
        setValue('linkedAccounts', [...linkedAccounts,{
            firstName: '',
            lastName: '',
            dob: '',
            phoneCode: '',
            phoneNumber: '',
        }])
    }

    const removeAccount = (index) => {
        setValue('linkedAccounts', linkedAccounts.filter((e, i) => {
            if(index!==i){
                return e
            }
        }))
    }

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then(({list}:any) => {
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setGyms(rows)
            if(rows.length>0){
                setGymId(rows[0])
                setValue('gymId', rows[0].value)
            }
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchCountries = () => {
        setCountryLoader(true)
        GetCountries().then((response:any) => {
            setCountries(
                response.map((e: any) => {
                    if(create && adminContext.admin?.countryId === e.id){
                        setCountryId({value:e.id, label: e.name})
                        setValue('countryId', e.id)
                        setValue('phoneCode', e.phoneCode)
                    }
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

    const onSubmit = async (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                case 'source':
                case 'leadType':
                    if(!data[key]) continue
                    break
                case 'isParent':
                    continue
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

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
                <Grid size={12}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Lead Details</Typography>
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
                                                    onInput={(e) => numberOnly(e, 4, false)}
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
                                                    onInput={(e) => numberOnly(e, 15, false)}
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
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Lead Sales</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="leadStatus" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Lead status is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true} error={!!error} sx={{mb:3}}>
                                                <InputLabel>Lead Status</InputLabel>
                                                <Select label="Lead Status" {...field} value={field.value || ''}>
                                                    <MenuItem value={LEAD_STATUS.HOT}>{LEAD_STATUS.HOT}</MenuItem>
                                                    <MenuItem value={LEAD_STATUS.COLD}>{LEAD_STATUS.COLD}</MenuItem>
                                                </Select>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="leadType" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true} error={!!error} sx={{mb:3}}>
                                                <InputLabel>Lead Type</InputLabel>
                                                <Select label="Lead Type" {...field} value={field.value || ''}>
                                                    { Object.keys(LEAD_TYPE).map((key:string) => {
                                                        return (<MenuItem key={key} value={key}>{LEAD_TYPE[key]}</MenuItem>)
                                                    }) }
                                                </Select>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="source" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl variant={'standard'} fullWidth={true} error={!!error} sx={{mb:3}}>
                                                <InputLabel>Lead Source</InputLabel>
                                                <Select label="Lead Source" {...field} value={field.value || ''}>
                                                    { Object.keys(LEAD_SOURCE).map((key:string) => {
                                                        return (<MenuItem key={key} value={key}>{LEAD_SOURCE[key]}</MenuItem>)
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
                    {
                        create || record?.isParent ?
                            <Card>
                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Child Accounts</Typography>
                                    { linkedAccounts?.length ?
                                        <>
                                            { linkedAccounts.map((e, index) => {
                                                return (
                                                    <Box key={e.id || index} sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" color={'primary'} gutterBottom sx={{mb:2}}>Account {index+1}</Typography>
                                                        <Grid container spacing={3}>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedAccounts[${index}].firstName`} control={control}
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
                                                                        <FormInput fullWidth={true} error={error} field={field} value={linkedAccounts[index].firstName || ''} label={'First Name'}/>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedAccounts[${index}].lastName`} control={control}
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
                                                                        <FormInput fullWidth={true} error={error} field={field} value={linkedAccounts[index].lastName || ''} label={'Last Name'}/>
                                                                    )}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                                                                <Controller name={`linkedAccounts[${index}].gender`} control={control}
                                                                    rules={{
                                                                        required: {
                                                                            value: "required",
                                                                            message: "Gender is required"
                                                                        },
                                                                    }}
                                                                    render={({ field, fieldState: { error } }) => (
                                                                        <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                                            <InputLabel>Gender</InputLabel>
                                                                            <Select label="Gender" {...field} value={linkedAccounts[index].gender || ''} error={!!error}>
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
                                                                <Controller name={`linkedAccounts[${index}].dob`} control={control}
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
                                                                                value={linkedAccounts[index].dob ? dayjs(linkedAccounts[index].dob) : null}
                                                                                format="MMM DD, YYYY"
                                                                                maxDate={dayjs()}
                                                                                onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
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
                                                                        <Controller name={`linkedAccounts[${index}].phoneCode`} control={control}
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
                                                                                    value={linkedAccounts[index].phoneCode || ''}
                                                                                    label={'Ph. Code'}
                                                                                    sx={{ width: { xs: '100%', sm: 90 }, flexShrink: 0 }}
                                                                                    onInput={(e) => numberOnly(e, 4, false)}
                                                                                />
                                                                            )}
                                                                        />
                                                                        <Controller name={`linkedAccounts[${index}].phoneNumber`} control={control}
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
                                                                                    value={linkedAccounts[index].phoneNumber || ''}
                                                                                    label={'Ph. No'}
                                                                                    sx={{ flex: 1, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}
                                                                                    onInput={(e) => numberOnly(e, 15, false)}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <IconButton
                                                                        aria-label="delete"
                                                                        sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' }, mt: { sm: 1 } }}
                                                                        onClick={() => removeAccount(index)}
                                                                    >
                                                                        <DeleteOutlineIcon color={'error'}/>
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
                                            disabled={linkedAccounts?.length >= maxChildAccounts}
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
                            disabled={loading || record?.customerId}
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

export default LeadForm
