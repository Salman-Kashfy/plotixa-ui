import {Fragment, useContext, useEffect, useState} from 'react'
import {InputLabel, Box, Card, CardContent, Typography, FormControl, MenuItem, FormHelperText} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import {GENDER_NAMES, GENDERS, GLOBAL_STATUSES, ROLE, ROLE_KEYS, ROLE_NAMES} from "../../utils/constants";
import Autocomplete from '@mui/material/Autocomplete';
import {Controller, useForm} from "react-hook-form";
import {GetGyms} from "../../services/gym.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthBrand, getAuthGym} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {numberOnly} from "../../utils/validations";
import {GetBrands} from "../../services/brand.service";
import {GetRoles} from "../../services/role.service";
import InputAdornment from "@mui/material/InputAdornment";
import FingerprintIcon from "@mui/icons-material/Fingerprint";

function AdminForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const [gymId, setGymId] = useState({});
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const [roleLoader, setRoleLoader] = useState(false);
    const [roleId, setRoleId] = useState({});
    const [roles, setRoles] = useState([]);
    const [brandLoader, setBrandLoader] = useState(false);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const defaultValues = {
        id: '',
        firstName: '',
        lastName: '',
        gender: '',
        phoneCode: '',
        phoneNumber: '',
        email: '',
        roleId: '',
        biometricUserId: '',
        status: create ? GLOBAL_STATUSES.ACTIVE : '',
        gymId: gymSelection ? '' : getAuthGym(),
        brandId: brandSelection ? '' : getAuthBrand()
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const _roleId = watch('roleId')
    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection && brandId?.value !== value?.value){
            setValue('gymId', '')
            setValue('brandId', value?.value)
            setBrandId({label: value?.label, value: value?.value})
        }
    }

    const handleRoleChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('roleId', value?.value)
        setRoleId({label: value?.label, value: value?.value})
    }

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
    }

    const fetchGyms = (brandId:string|undefined = undefined) => {
        setGymLoader(true)
        GetGyms({limit:0}, {brandId}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchRoles = () => {
        setRoleLoader(true)
        GetRoles().then(({list}:any) => {
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setRoles(rows)
            setRoleLoader(false)
        }).catch((e) => {
            setRoleLoader(false)
            console.log(e.message)
        })
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
        if(gymSelection){
            fetchGyms()
        }
        if(create){
            fetchRoles()
        }
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record);
            fetchRoles()
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
        if(brands.length && !isEmpty(record)){
            const brand = brands.find((e) => e.value === record.brandId)
            if(brand){
                setBrandId({label: brand.label, value: brand.value})
            }
        }
    }, [record, brands]);

    useEffect(() => {
        if(roles.length && !isEmpty(record)){
            const role = roles.find((e) => e.value === record.roleId)
            if(role){
                setRoleId({label: role.label, value: role.value})
            }
        }
    }, [record, roles]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Admin Details</Typography>
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
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Phone Code'} sx={{ width: { xs: '100%', sm: 90 }, flexShrink: 0 }} onInput={(e) => numberOnly(e,4, false)}/>
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
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Phone Number'} sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }} onInput={(e) => numberOnly(e,15, false)}/>
                                            )}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Controller name="roleId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Role is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="roles-dd"
                                                options={roles}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={roleId}
                                                loading={roleLoader}
                                                onChange={handleRoleChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!roles.length} error={error} label={'Role'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {roleLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                                {
                                    (_roleId && brandSelection && [ROLE_NAMES.BRAND_ADMIN].includes(roles.find((e) => e.value === _roleId)?.label)) ?
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Controller name="brandId" control={control}
                                                rules={{
                                                    validate: (value) => {
                                                        if (isEmpty(value) && [ROLE_NAMES.BRAND_ADMIN].includes(roles.find((e) => e.value === _roleId)?.label)){
                                                            return "Brand is required";
                                                        }
                                                        return true;
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
                                {
                                    (_roleId && gymSelection && ![ROLE_NAMES.BRAND_ADMIN].includes(roles.find((e) => e.value === _roleId)?.label)) ?
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Controller name="gymId" control={control}
                                                rules={{
                                                    validate: (value) => {
                                                        if (isEmpty(value) && ![ROLE_NAMES.BRAND_ADMIN].includes(roles.find((e) => e.value === _roleId)?.label)){
                                                            return "Gym is required";
                                                        }
                                                        return true;
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
                                    <Controller name="biometricUserId" control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} disabled={roles.find((e) => e.value === _roleId)?.label === ROLE_NAMES.BRAND_ADMIN} field={field} value={field.value || ''} label={'Biometric User ID'} InputProps={{
                                                startAdornment: <InputAdornment position="start"><FingerprintIcon/></InputAdornment>,
                                            }}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            </Grid>
        </form>
    )
}

export default AdminForm