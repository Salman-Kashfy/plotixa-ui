import {useContext, useEffect, useState,Fragment} from 'react'
import {Box, Card, CardContent, Typography, FormControl, FormLabel, RadioGroup, Checkbox, FormControlLabel, Radio, FormHelperText} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {CHAMPION_TYPE, ROLE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {getAuthBrand} from "../../utils/permissions";
import {GetMembershipPlanGroups} from "../../services/membership.plan.group.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import {GetBrands} from "../../services/brand.service";
import {AdminContext} from "../../hooks/AdminContext";
import {numberOnly} from "../../utils/validations";
import {GetGyms} from "../../services/gym.service";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CircularProgress from '@mui/material/CircularProgress';
import FormInput from '../../components/FormInput';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function MembershipPlanForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const [planGroupId, setPlanGroupId] = useState({});
    const [planGroups, setPlanGroups] = useState([]);
    const [brandId, setBrandId] = useState({});
    const [brands, setBrands] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const [loadPlanGroups, setLoadPlanGroups] = useState(false);
    const defaultValues = {
        id: '',
        name: '',
        groupId: '',
        visible: null,
        description: null,
        isChampion: null,
        championType: '',
        customGymIds: '',
        gracePeriodCancellation: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const isChampion = watch('isChampion')
    const championType = watch('championType')
    const groupId = watch('groupId')
    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        if(brandSelection && brandId?.value !== value?.value){
            setBrandId({label: value?.label, value: value?.value})
            setValue('customGymIds', [])
            setValue('groupId', '')
            setPlanGroupId({})
            if(value?.value){
                fetchGyms(value?.value)
                fetchPlanGroups(value?.value)
            }
        }
    }

    const handleCustomGymChange = (customGymIds) => {
        setValue('customGymIds', customGymIds.map((e) => e.value))
        setGyms(gyms.map((e) => {
            e.selected = customGymIds.some((_e) => _e.value === e.value)
            return e
        }))
    };

    const fetchPlanGroups = (brandId) => {
        setLoadPlanGroups(true)
        GetMembershipPlanGroups({limit:0},{brandId}).then(({list}:any) => {
            setPlanGroups(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setLoadPlanGroups(false)
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const fetchBrands = () => {
        GetBrands({limit:0},{brandId: brandId.value}).then(({list}:any) => {
            const brands = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setBrands(brands)
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const fetchGyms = (brandId:string|undefined = undefined) => {
        return new Promise((resolve) => {
            setGymLoader(true)
            GetGyms({limit:0},{brandId}).then((brands:any) => {
                const { list } = brands
                const rows = list.map((e:any) => {
                    return { value: e.id, label: e.name, selected: false }
                })
                setGyms(rows)
                setGymLoader(false)
                resolve(rows)
            }).catch((e) => {
                resolve([])
                setGymLoader(false)
                console.log(e.message)
            })
        })
    }

    const onSubmit = async (data) => {
        delete data?.gym
        delete data?.brand
        delete data?.country
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'championType':
                    data[key] = data[key] || undefined
                    break
                case 'gracePeriodCancellation':
                    data[key] = parseInt(data[key])
                    break
                case 'visible':
                case 'isChampion':
                    data[key] = data[key] === true || (typeof data[key] === "string" && data[key] === "true");
                    break
                default:
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key].toString() || '') : data[key]
        }
        reset(_data)
    }

    const handlePlanGroupChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('groupId', value?.value)
        setPlanGroupId({label: value?.label, value: value?.value})
    }

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            if(brandSelection){
                setBrandId({label: record.group.brand.name, value: record.group.brand.id})
                fetchPlanGroups(record.group.brand.id)
            }
            (async () => {
                try {
                    const rows = await fetchGyms(brandSelection ? record.group.brand.id : getAuthBrand())
                    setGyms(rows.map((e:any) => {
                        return { value: e.value, label: e.label, selected: record?.customGyms?.length ? record.customGyms.some((customGym) => customGym.id === e.value ) : false }
                    }))
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [record]);

    useEffect(() => {
        if(brandSelection){
            fetchBrands()
        }else{
            fetchPlanGroups(getAuthBrand())
            if(create){
                fetchGyms(getAuthBrand())
            }
        }
    }, [])

    useEffect(() => {
        if(planGroups.length && !isEmpty(record)){
            const row = planGroups.find((e) => e.value === record.groupId)
            if(row){
                setPlanGroupId({label: row.label, value: row.value})
            }
        }
    }, [record, planGroups]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Membership Plan Details</Typography>
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
                                            <Autocomplete
                                                id="brands-dd"
                                                options={brands}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={brandId}
                                                onChange={handleBrandChange}
                                                disableClearable
                                                renderInput={(params) => <FormInput disabled={!brands.length} {...params} label="Brand" params={params}/>}
                                            />
                                        </Grid>
                                        : <></>
                                }
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="groupId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Plan Group is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="plan-group-dd"
                                                options={planGroups}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={loadPlanGroups || !groupId ? {} : planGroupId}
                                                loading={loadPlanGroups}
                                                onChange={handlePlanGroupChange}
                                                renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Plan Group'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {loadPlanGroups ? <CircularProgress color="inherit" size={20} /> : null}
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
                                    <Controller name="gracePeriodCancellation" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Cancellation Period is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Cancellation Period'} onInput={(e) => numberOnly(e,2)}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <Controller name="description" control={control}
                                        rules={{
                                            maxLength: {
                                                value: 250,
                                                message: "Description must not exceed 250 characters"
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
                            <Typography variant="h6" sx={{ mb: 2 }}>Plan Options</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="visible" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Visiblity is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Visiblity</FormLabel>
                                            <RadioGroup
                                                sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0, sm: 1 } }}
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(event) => field.onChange(event.target.value)}
                                            >
                                                <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Enable" />
                                                <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="Disable" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            <Box sx={{mb:2}}>
                                <Controller name="isChampion" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (value === '' || value === null){
                                                return "Field is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormLabel>Scope</FormLabel>
                                            <RadioGroup
                                                sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0, sm: 1 } }}
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(event) => field.onChange(event.target.value)}
                                            >
                                                <FormControlLabel value={true} control={<Radio checked={field.value === true || field.value === 'true'}/>} label="Global" />
                                                <FormControlLabel value={false} control={<Radio checked={field.value === false || field.value === 'false'}/>} label="Local" />
                                            </RadioGroup>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            { isChampion === true || isChampion === 'true' ?
                                <Box sx={{mb:2}}>
                                    <Controller name="championType" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (!value && isChampion ){
                                                    return "Champion type is required";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error}>
                                                <FormLabel>Coverage</FormLabel>
                                                <RadioGroup
                                                    sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0, sm: 1 } }}
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                >
                                                    <FormControlLabel value={CHAMPION_TYPE.DOMESTIC} control={<Radio checked={field.value === 'DOMESTIC'}/>} label="Domestic" />
                                                    <FormControlLabel value={CHAMPION_TYPE.CUSTOM} control={<Radio checked={field.value === 'CUSTOM'}/>} label="Custom" />
                                                </RadioGroup>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                            : <></> }
                            { (isChampion === true || isChampion === 'true') && championType === CHAMPION_TYPE.CUSTOM ?
                            <Box sx={{mb:2}}>
                                <Controller name="customGymIds" control={control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Gym is required"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-gyms"
                                            options={gyms}
                                            value={gyms.filter((e) => e.selected === true)}
                                            loading={gymLoader}
                                            disableCloseOnSelect
                                            getOptionLabel={(option) => option.label}
                                            onChange={(event, newValue) => {
                                                field.onChange(newValue);
                                                handleCustomGymChange(newValue);
                                            }}
                                            renderOption={(props, option, { selected }) => {
                                                const { key, ...optionProps } = props;
                                                return (
                                                    <li key={key} {...optionProps}>
                                                        <Checkbox
                                                            icon={icon}
                                                            checkedIcon={checkedIcon}
                                                            style={{ marginRight: 8 }}
                                                            checked={selected}
                                                        />
                                                        {option.label}
                                                    </li>
                                                );
                                            }}
                                            renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Gyms'} params={params}
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
                            </Box>
                            : <></> }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    )
}

export default MembershipPlanForm
