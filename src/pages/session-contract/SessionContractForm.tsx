import {Fragment, useCallback, useEffect, useState} from 'react'
import {Box, Checkbox, FormControl, FormHelperText} from '@mui/material';
import {SERVICE_TYPE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {GetServices} from "../../services/service.service";
import {GetInstructors} from "../../services/instructor.service";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {debounce} from "@mui/material/utils";
import {GetCustomers} from "../../services/customer.service";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

dayjs.extend(utc);

function SessionContractForm({record = {}, callback, btnLabel, loading, formLoader = false, customer}) {
    const [serviceId, setServiceId] = useState({});
    const [services, setServices] = useState([]);
    const [serviceLoader, setServiceLoader] = useState(false);
    const [instructorId, setInstructorId] = useState({});
    const [instructors, setInstructors] = useState([]);
    const [instructorLoader, setInstructorLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [customers, setCustomers] = useState([]);
    const [customerLoading, setCustomerLoading] = useState(false);
    const defaultValues = {
        id: '',
        serviceId: '',
        startDate: '',
        customerId: customer.id,
        instructorId: '',
        memberIds: [],
        note: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const handleServiceChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('serviceId', value?.value)
        setServiceId({label: value?.label, value: value?.value, serviceType: value?.serviceType})
    }

    const handleInstructorChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('instructorId', value?.value)
        setInstructorId({label: value?.label, value: value?.value})
    }

    const handleMemberChange = (members) => {
        setValue('memberIds', members.map((e) => e.value))
        setCustomers(customers.map((e) => {
            e.selected = members.some((_e) => _e.value === e.value)
            return e
        }))
    };

    const fetchServices = () => {
        setServiceLoader(true)
        GetServices({limit:0},{brandId: customer.gym.brandId}).then(({list}:any) => {
            setServices(list.map((e:any) => {
                return { value: e.id, label: e.name, serviceType: e.serviceType }
            }))
            setServiceLoader(false)
        }).catch((e) => {
            setServiceLoader(false)
            console.log(e.message)
        })
    }

    const fetchInstructors = () => {
        setInstructorLoader(true)
        GetInstructors({limit:0},{gymId: customer.gymId}).then(({list}:any) => {
            setInstructors(list.map((e:any) => {
                return { value: e.id, label: e.fullName }
            }))
            setInstructorLoader(false)
        }).catch((e) => {
            setInstructorLoader(false)
            console.log(e.message)
        })
    }

    const debouncedFetch = useCallback(
        debounce((searchCustomer, customers) => fetchCustomers(searchCustomer, customers), 500),
        []
    );

    useEffect(() => {
        if (searchCustomer){
            debouncedFetch(searchCustomer, customers)
        } else {
            setCustomers(customers.filter((e) => e.selected === true))
        }
    }, [searchCustomer, debouncedFetch]);

    const fetchCustomers = (searchCustomer, customers) => {
        setCustomerLoading(true)
        GetCustomers({page:1}, {gymId: customer.gymId, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            setCustomers([
                ...list
                    .filter((e: any) => !customers.some((c) => c.value === e.id) && e.id !== customer.id)
                    .map((e: any) => ({ value: e.id, label: e.fullName+' ('+e.customerCode+')' })),
                ...customers.filter((e) => e.selected === true),
            ]);
            setCustomerLoading(false)
        }).catch((e) => {
            setCustomerLoading(false)
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        delete data?.brand
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if(!data[key]) continue
                    break
                case 'startDate':
                    const currentDate = dayjs().utc();
                    const inputDate = dayjs(data.startDate);
                    const isToday = inputDate.isSame(currentDate, 'day');
                    data[key] = isToday
                        ? currentDate.format('YYYY-MM-DD HH:mm:ss')
                        : inputDate.format('YYYY-MM-DD HH:mm:ss')

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
        if(!isEmpty(customer)){
            fetchServices()
            fetchInstructors()
        }
    }, [customer])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
            setServiceId({label: record.service.name, value: record.service.id, serviceType: record.service.serviceType})
            if(!record.isServicePack){
                setInstructorId({label: record.instructor.fullName, value: record.instructor.id})
            }
            if(!isEmpty(record.members)){
                setCustomers(record.members.map((e) => {
                    return {
                        value: e.id,
                        label: e.fullName+' ('+e.customerCode+')',
                        selected: true,
                    }
                }))
            }
        }
    }, [record]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                <ProgressBar formLoader={loading || formLoader}/>
                <Box>
                    <Box sx={{mb:2, pt: 1}}>
                        <Controller name="serviceId" control={control}
                            rules={{
                                required: {
                                    value: "required",
                                    message: "Service is required"
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <Autocomplete
                                    id="services-dd"
                                    options={services}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={serviceId}
                                    loading={serviceLoader}
                                    onChange={handleServiceChange}
                                    renderInput={(params) => <FormInput fullWidth={true} disabled={!services.length} error={error} label={'Service'} params={params}
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <Fragment>
                                                        {serviceLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                    {
                        isEmpty(record) || !record?.isServicePack ?
                            <Box sx={{mb:2}}>
                                <Controller name="instructorId" control={control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Instructor is required"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <Autocomplete
                                            id="instructors-dd"
                                            options={instructors}
                                            getOptionLabel={(option) => option.label || ''}
                                            value={instructorId}
                                            loading={instructorLoader}
                                            onChange={handleInstructorChange}
                                            renderInput={(params) => <FormInput fullWidth={true} disabled={!instructors.length} error={error} label={'Instructor'} params={params}
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
                            </Box>
                            :<></>
                    }
                    <Box sx={{mb:2}}>
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
                    </Box>
                    {
                        serviceId?.serviceType === SERVICE_TYPE.GROUP_SESSION ?
                            <Box sx={{mb:2}}>
                                <Controller name="memberIds" control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (serviceId?.serviceType === SERVICE_TYPE.GROUP_SESSION && isEmpty(value)) {
                                                return "Member is required";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-members"
                                            options={customers}
                                            value={customers.filter((e) => e.selected === true)}
                                            loading={customerLoading}
                                            disableCloseOnSelect
                                            freeSolo={true}
                                            onInput={(event) => setSearchCustomer(event.target.value)}
                                            getOptionLabel={(option) => option.label}
                                            onChange={(event, newValue) => {
                                                field.onChange(newValue);
                                                handleMemberChange(newValue);
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
                                            renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Members'} placeholder={isEmpty(field.value) ? 'Search customers' : ''} params={params}
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <Fragment>
                                                                {customerLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                            :<></>
                    }
                    <Box sx={{mb:2}}>
                        <Controller name="note" control={control}
                            rules={{
                                maxLength: {
                                    value: 50,
                                    message: "Note must not exceed 50 characters"
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormInput field={field} value={field.value || ''} error={error} label={'Note'} fullWidth={true}/>
                            )}
                        />
                    </Box>
                </Box>
                <Box sx={{ mt: 3, textAlign: { xs: 'center', sm: 'right' } }}>
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
            </Box>
        </form>
    )
}

export default SessionContractForm
