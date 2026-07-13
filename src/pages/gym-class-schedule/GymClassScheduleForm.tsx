import {Fragment, useContext, useEffect, useState, SyntheticEvent} from 'react'
import {
    InputLabel,
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    MenuItem,
    FormHelperText,
    Button, IconButton, Checkbox, FormControlLabel
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import {DAY_TO_WEEKDAY, GENDER_NAMES, GENDERS, GLOBAL_STATUSES, ROLE} from "../../utils/constants";
import Autocomplete from '@mui/material/Autocomplete';
import {Controller, useForm} from "react-hook-form";
import {GetGyms} from "../../services/gym.service";
import {GetGymClasses} from "../../services/class.service";
import {GetInstructors} from "../../services/instructor.service";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthGym} from "../../utils/permissions";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import AddIcon from '@mui/icons-material/Add';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {decimalOnly, numberOnly} from "../../utils/validations";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function GymClassScheduleForm({record = {}, callback, btnLabel, loading, formLoader = false, create = false}) {
    const adminContext = useContext(AdminContext)
    const [gymClassId, setGymClassId] = useState({});
    const [gymClasses, setGymClasses] = useState([]);
    const [gymClassLoader, setGymClassLoader] = useState(false);

    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [gymId, setGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [gyms, setGyms] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);

    const [instructors, setInstructors] = useState([]);
    const [instructorLoader, setInstructorLoader] = useState(false);

    const maxSchedule = 12
    const [expanded, setExpanded] = useState<string | false>('');
    const defaultValues = {
        id: '',
        gym: {},
        gymId: gymSelection ? '' : getAuthGym(),
        gymClassId: '',
        spots: '',
        startDate: '',
        endDate: '',
        duration: '',
        gender: '',
        dropInClient: '',
        dropInClientPrice: '',
        gymMemberClient: '',
        gymMemberClientPrice: '',
        status: GLOBAL_STATUSES.ACTIVE,
        schedule: [],
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset, setError, clearErrors} = useForm({
        mode: "onChange",
        defaultValues
    })

    const gym = watch('gym')
    const spots = watch('spots')
    const gender = watch('gender')
    const duration = watch('duration')
    const schedule = watch('schedule')
    const startDate = watch('startDate')
    const dropInClient = watch('dropInClient')
    const gymMemberClient = watch('gymMemberClient')
    const handleClassChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymClassId', value?.value)
        setGymClassId({label: value?.label, value: value?.value})
    }

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
        fetchInstructors(value?.value)
    }

    const handlePanelChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    }

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchInstructors = (gymId) => {
        setInstructorLoader(true)
        GetInstructors({limit:0},{gymId}).then(({list}:any) => {
            setInstructors(list.map((e:any) => {
                return { value: e.id, label: e.fullName, selected: false }
            }))
            setInstructorLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchGymClasses = () => {
        setGymClassLoader(true)
        GetGymClasses({limit:0}).then(({list}:any) => {
            setGymClasses(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymClassLoader(false)
        }).catch((e) => {
            setGymClassLoader(false)
            console.log(e.message)
        })
    }

    const addSchedule = () => {
        if(schedule?.length>=maxSchedule) return
        setValue('schedule', [...schedule,{
            day: '',
            openTime: null,
            spots,
            gender,
            duration,
            instructors,
            instructorIds: [],
        }])
        setExpanded('panel'+schedule.length)
    }

    const removeSchedule = (e, index) => {
        e.stopPropagation();
        setValue('schedule', schedule.filter((e, i) => {
            if(index!==i){
                return e
            }
        }))
    }

    const onSubmit = async (data) => {
        if(!dropInClient && !gymMemberClient){
            setError("dropInClient", { type: "manual", message: "Select at least one price option" })
            return
        }else{
            clearErrors("dropInClient")
        }
        delete data.gym
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'spots':
                case 'duration':
                    data[key] = parseInt(data[key])
                    break
                case 'dropInClient':
                case 'gymMemberClient':
                    data[key] = data[key] === true || (typeof data[key] === "string" && data[key] === "true");
                    break
                case 'schedule':
                    data[key] = data[key].map((e) => {
                        delete e.instructors
                        e.day = parseInt(e.day)
                        e.spots = parseInt(e.spots)
                        e.duration = parseInt(e.duration)
                        return e
                    })
                    break
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
        if(gymSelection){
            fetchGyms()
        }else if(create && gymId?.value){
            fetchInstructors(gymId?.value)
        }
        fetchGymClasses()
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            fetchInstructors(record.gymId)
        }
    }, [record]);

    useEffect(() => {
        if(!isEmpty(record) && !isEmpty(instructors)){
            setValue('schedule', schedule.map((obj) => {
                obj.instructors = instructors.map((e) => {
                    return {
                        value: e.value,
                        label: e.label,
                        selected: obj.instructorIds.includes(e.value)
                    }
                })
                return obj
            }))
        }
    }, [record, instructors]);

    const handleInstructorChange = (newValue,index) => {
        schedule[index].instructors = instructors.map((e) => {
            return {
                value: e.value,
                label: e.label,
                selected: newValue.map((e) => e.value).includes(e.value)
            }
        })
        schedule[index].instructorIds = schedule[index].instructors.filter((e) => e.selected === true).map((e) => e.value)
        setValue('schedule', schedule);
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
        if(gymClasses.length && !isEmpty(record)){
            const gymClass = gymClasses.find((e) => e.value === record.gymClassId)
            if(gymClass){
                setGymClassId({label: gymClass.label, value: gymClass.value})
            }
        }
    }, [record, gymClasses]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }} order={{ xs: 2, md: 1 }}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Class Schedule Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="gymClassId" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Class is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <Autocomplete
                                                id="gym-classes-dd"
                                                options={gymClasses}
                                                getOptionLabel={(option) => option.label || ''}
                                                value={gymClassId}
                                                loading={gymClassLoader}
                                                onChange={handleClassChange}
                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!gymClasses.length} error={error} label={'Class'} params={params}
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <Fragment>
                                                                    {gymClassLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                                    <Controller name="startDate" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Start date is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} fullWidth={true}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Start date"
                                                        closeOnSelect={true}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        format="MMM DD, YYYY"
                                                        onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'standard',
                                                                sx:{width:'100%'},
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="endDate" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "End date is required"
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} fullWidth={true}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="End date"
                                                        closeOnSelect={true}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        format="MMM DD, YYYY"
                                                        onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'standard',
                                                                sx:{width:'100%'},
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="duration" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Duration is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Duration (In mins)'} onInput={(e) => numberOnly(e,2)}/>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller name="spots" control={control}
                                        rules={{
                                            required: {
                                                value: "required",
                                                message: "Spots is required"
                                            },
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Spots'} onInput={(e) => numberOnly(e,2)}/>
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
                                                    { Object.keys(GENDERS).map((key:string) => {
                                                        return (<MenuItem value={key} key={key}>{GENDER_NAMES[key]}</MenuItem>)
                                                    }) }
                                                </Select>
                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
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
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Class Schedule</Typography>
                            {
                                schedule.length ?
                                    <Box sx={{mb:3}}>
                                        {
                                            schedule.map((e, index) => {
                                                return (
                                                    <Accordion key={index} expanded={expanded === 'panel'+index} onChange={handlePanelChange('panel'+index)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon />}
                                                            aria-controls={'panelbh-content-'+index}
                                                            id={'panelbh-header-'+index}
                                                            sx={{
                                                                flexDirection: 'row-reverse',
                                                                gap: 1,
                                                                '& .MuiAccordionSummary-content': {
                                                                    flexWrap: 'wrap',
                                                                    gap: 1,
                                                                    alignItems: 'center',
                                                                    minWidth: 0,
                                                                },
                                                            }}
                                                        >
                                                            <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0, pt: { sm: 1 } }}>
                                                                <Typography component="span" color={'primary'} sx={{ fontWeight: 500 }}>{DAY_TO_WEEKDAY[schedule[index]?.day]} </Typography>
                                                                <Typography component="span" sx={{ fontWeight: 500 }}>{schedule[index].openTime ? dayjs('2025-01-01 '+schedule[index].openTime).format('hh:mm A') : '' }</Typography>
                                                            </Box>
                                                            <Typography component="span" color={'error'} sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, order: { xs: 3, sm: 0 } }}>
                                                                { errors?.schedule?.[index]?.day?.message || errors?.schedule?.[index]?.duration?.message || errors?.schedule?.[index]?.gender?.message || errors?.schedule?.[index]?.openTime?.message || errors?.schedule?.[index]?.instructorIds?.message }
                                                            </Typography>
                                                            <Box sx={{ marginLeft: 'auto' }}>
                                                                <IconButton onClick={(e) => removeSchedule(e, index)}>
                                                                    <DeleteOutlineIcon color={'error'}/>
                                                                </IconButton>
                                                            </Box>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                    <Controller name={`schedule[${index}].day`} control={control}
                                                                        rules={{
                                                                            required: {
                                                                                value: "required",
                                                                                message: "Day is required"
                                                                            },
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                                                <InputLabel>Day</InputLabel>
                                                                                <Select label="Day" {...field} value={field.value || ''} error={!!error}>
                                                                                    { Object.keys(DAY_TO_WEEKDAY).map((key:string) => {
                                                                                        return (<MenuItem value={key} key={key} disabled={schedule.some((e) => e.day == key)}>{DAY_TO_WEEKDAY[key]}</MenuItem>)
                                                                                    }) }
                                                                                </Select>
                                                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                                            </FormControl>
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                    <Controller name={`schedule[${index}].openTime`} control={control}
                                                                        rules={{
                                                                            required: {
                                                                                value: "required",
                                                                                message: "Time is required"
                                                                            },
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                <TimePicker
                                                                                    label={'Time'}
                                                                                    closeOnSelect
                                                                                    value={field.value ? dayjs(`${startDate}T${field.value}`) : null}
                                                                                    onChange={(newValue) => field.onChange(newValue ? newValue.format('HH:mm:ss') : null)}
                                                                                    slotProps={{
                                                                                        textField: {
                                                                                            variant: 'standard',
                                                                                            sx: { width: '100%' },
                                                                                            error: !!error,
                                                                                            helperText: error?.message,
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            </LocalizationProvider>
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                    <Controller name={`schedule[${index}].duration`} control={control}
                                                                        rules={{
                                                                            required: {
                                                                                value: "required",
                                                                                message: "Duration is required"
                                                                            },
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Duration (In mins)'} onInput={(e) => numberOnly(e,2)}/>
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                    <Controller name={`schedule[${index}].gender`} control={control}
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
                                                                                    { Object.keys(GENDERS).map((key:string) => {
                                                                                        return (<MenuItem value={key} key={key}>{GENDER_NAMES[key]}</MenuItem>)
                                                                                    }) }
                                                                                </Select>
                                                                                {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                                            </FormControl>
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                                    <Controller name={`schedule[${index}].spots`} control={control}
                                                                        rules={{
                                                                            required: {
                                                                                value: "required",
                                                                                message: "Spot is required"
                                                                            },
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Spots'} onInput={(e) => numberOnly(e,2)}/>
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                                                                    <Controller name={`schedule[${index}].instructorIds`} control={control}
                                                                        rules={{
                                                                            required: {
                                                                                value: "required",
                                                                                message: "Instructor is required"
                                                                            }
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <Autocomplete
                                                                                multiple
                                                                                id="checkboxes-instructors"
                                                                                options={schedule[index]?.instructors || []}
                                                                                value={schedule[index].instructors?.filter((e) => e.selected === true) || []}
                                                                                loading={instructorLoader}
                                                                                disableCloseOnSelect
                                                                                getOptionLabel={(option) => option.label}
                                                                                onChange={(event, newValue) => {
                                                                                    field.onChange(newValue);
                                                                                    handleInstructorChange(newValue,index);
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
                                                                                renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Instructor(s)'} params={params}
                                                                                    slotProps={{
                                                                                        input: {
                                                                                            ...params.InputProps,
                                                                                            endAdornment: (
                                                                                                <Fragment>
                                                                                                    {instructorLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                                                            </Grid>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )
                                            })
                                        }
                                    </Box>
                                :<></>
                            }
                            <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                <Button onClick={addSchedule} disabled={schedule?.length>=maxSchedule || loading || !gymId?.value} startIcon={<AddIcon/>} sx={{ width: { xs: '100%', sm: 'auto' } }}>Schedule</Button>
                            </Box>
                        </CardContent>
                    </Card>
                    <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                        <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading || !!record?.orderCount} sx={{ width: { xs: '100%', sm: 'auto' } }}>{btnLabel}</LoadingButton>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} order={{ xs: 1, md: 2 }}>
                    <Card sx={{mb:2}}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" sx={{mb:2}}>Pricing</Typography>
                            <Box sx={{mb:2}}>
                                <Controller name="gymMemberClient" control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormControlLabel control={<Checkbox checked={field.value === true || field.value === 'true'}/>} label="Permit Members"
                                                onChange={(event, newValue) => {
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                                <Controller name="dropInClient" control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl error={!!error}>
                                            <FormControlLabel control={<Checkbox checked={field.value === true || field.value === 'true'}/>} label="Permit Non Members"
                                                  onChange={(event, newValue) => {
                                                      field.onChange(newValue);
                                                  }}
                                            />
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                            { gymMemberClient ?
                                <Box sx={{mb:2}}>
                                    <Controller name="gymMemberClientPrice" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (gymMemberClient && isEmpty(value)){
                                                    return "Price for members is required";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Price (Members) ' + (!isEmpty(gym) ? `(${gym.brand.country.currency.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Box>
                                :<></>
                            }
                            { dropInClient ?
                                <Box sx={{mb:2}}>
                                    <Controller name="dropInClientPrice" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (dropInClient && isEmpty(value)){
                                                    return "Price for non-members is required";
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Price (Non Members) ' + (!isEmpty(gym) ? `(${gym.brand.country.currency.symbol})` : '' )} onInput={decimalOnly}/>
                                        )}
                                    />
                                </Box>
                                :<></>
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    )
}

export default GymClassScheduleForm
