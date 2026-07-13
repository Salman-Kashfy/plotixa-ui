import {Fragment, useCallback, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {Box, Checkbox, FormControl, FormHelperText, Button} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {debounce} from "@mui/material/utils";
import {GetCustomers} from "../../services/customer.service";
import {GetSessionContracts} from "../../services/session-contract.service";
import dayjs from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import {PERMISSIONS, PT_SESSION_ATTEND_STATUS, SERVICE_TYPE, SESSION_CONTRACT_STATUS} from "../../utils/constants";
import {isEmpty,isArray} from "lodash";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Grid from "@mui/material/Grid2";
import {hasPermission} from "../../utils/permissions";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ContractBooking({defaultValues, callback, btnLabel, loading, instructors, unbookCallback, attendCallback, gymId = null}) {
    const [instructorId, setInstructorId] = useState({});
    const [contracts, setContracts] = useState([]);
    const [contractId, setContractId] = useState({});
    const [contractLoader, setContractLoader] = useState(false);

    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState({});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const [members, setMembers] = useState([]);
    const [memberLoader, setMemberLoader] = useState(false);
    const [searchMember, setSearchMember] = useState("");

    const {control, handleSubmit, formState: {errors}, trigger, reset, clearErrors, setValue, watch} = useForm({
        mode: "onChange",
        defaultValues
    })

    const sessions = watch('sessions')
    const forDate = watch('sessions.forDate')
    const closeTime = watch('sessions.closeTime')
    const bookingPermission = hasPermission(PERMISSIONS.SESSION_CONTRACT.BOOK)

    const handleContractChange = (event: any, value: { value: string, label: string, serviceType: string, sessionDuration: number } | null) => {
        setValue('sessionContractId', value?.value)
        setValue('instructorId', value?.instructorId)
        setContractId({label: value?.label, value: value?.value, serviceType: value?.serviceType, sessionDuration: value?.sessionDuration, instructorId: value?.instructorId, remainingSessions: value?.remainingSessions})
        if(value?.sessionDuration && sessions.openTime){
            sessions.closeTime = dayjs(`2025-01-01 ${sessions.openTime}`).add(value?.sessionDuration,'minute').format('HH:mm:ss')
            setValue('sessions', sessions);
        }
    }

    const handleInstructorChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('instructorId', value?.value)
        setInstructorId({label: value?.label, value: value?.value})
        if(value?.value){
            clearErrors('instructorId')
        }
    }

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        setCustomerId({label: value?.label, value: value?.value})
    }

    const handleOpenTimeChange = (newValue) => {
        sessions.openTime = newValue.format('HH:mm:ss')
        if(contractId?.sessionDuration){
            sessions.closeTime = dayjs(`2025-01-01 ${sessions.openTime}`).add(contractId.sessionDuration,'minute').format('HH:mm:ss')
        }
        setValue('sessions', sessions);
    };

    const handleEndTimeChange = (newValue) => {
        sessions.closeTime = newValue.format('HH:mm:ss')
        setValue('sessions', sessions);
    };

    const debouncedFetchCustomer = useCallback(
        debounce((searchCustomer) => fetchCustomers(searchCustomer), 500),
        []
    );

    const debouncedFetchMember = useCallback(
        debounce((searchMember,members,customerId) => fetchMembers(searchMember,members,customerId), 500),
        []
    );

    const fetchContracts = (customerId) => {
        setContractLoader(true)
        GetSessionContracts({limit:0},{customerId,isPaid:true,status:SESSION_CONTRACT_STATUS.ACTIVE}).then((contracts:any) => {
            const { list } = contracts
            const rows = list.map((e:any) => {
                return {
                    value: e.id,
                    label: e.service.name + ` (${e.remainingSessions+'/'+e.totalSessions})`,
                    sessionDuration: e.sessionDuration,
                    instructorId: e.instructorId,
                    serviceType: e.service.serviceType,
                    remainingSessions: e.remainingSessions,
                }
            })
            setContractLoader(false)
            setContracts(rows)
        }).catch(() => {
            setContractLoader(false)
        })
    }

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    useEffect(() => {
        if (searchMember){
            debouncedFetchMember(searchMember,members,customerId)
        }
    }, [searchMember, debouncedFetchMember]);

    useEffect(() => {
        if (customerId?.value){
            fetchContracts(customerId.value)
        }else {
            setValue('sessionContractId', '')
            setContractId({})
        }
    }, [customerId]);

    useEffect(() => {
        if (closeTime) {
            trigger("sessions.closeTime"); // Forces validation to run again
        }
    }, [closeTime]);

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    useEffect(() => {
        if(!isEmpty(defaultValues)){
            initializeForm(defaultValues)
        }
    }, [defaultValues]);

    useEffect(() => {
        if(defaultValues.id && instructors.length){
            setInstructorId({value: defaultValues.instructorId, label: instructors.find((e:any) => e.value === defaultValues.instructorId).label})

            const { customer } = defaultValues
            const obj = {value: customer.id, label: customer.fullName+' ('+customer.customerCode+')'}
            setCustomers([obj])
            setCustomerId(obj)
            setContractId({value: defaultValues.sessionContractId, label: defaultValues.serviceName})

            if(!isEmpty(defaultValues.members) && isArray(defaultValues.members)){
                setMembers(defaultValues.members.map((e) => {
                    return {
                        value: e.id,
                        label: e.fullName+' ('+e.customerCode+')',
                        selected: true,
                    }
                }))
            }
        }
    }, [defaultValues,instructors]);

    useEffect(() => {
        if(defaultValues.id && contracts.length){
            const _contract = contracts.find((e) => e.value === defaultValues.sessionContractId)
            setContractId({value: defaultValues.sessionContractId, label: _contract.label, serviceType:_contract.serviceType, sessionDuration:_contract.sessionDuration , remainingSessions:_contract.remainingSessions })
            clearErrors('sessionContractId')
        }
    }, [defaultValues,contracts]);

    const fetchCustomers = (searchCustomer) => {
        setCustomerLoader(true)
        GetCustomers({page:1}, {gymId, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            setCustomers(list.map((e) => {
                return {
                    value: e.id,
                    label: e.fullName+' ('+e.customerCode+')'
                }
            }))
            setCustomerLoader(false)
        }).catch((e) => {
            setCustomerLoader(false)
            console.log(e.message)
        })
    }

    const fetchMembers = (searchMember,members, customerId) => {
        setMemberLoader(true)
        GetCustomers({page:1}, {gymId, searchText: searchMember}).then((response:any) => {
            const { list } = response
            setMembers([
                ...list
                    .filter((e: any) => !members.some((c) => c.value === e.id) && e.id !== customerId.value)
                    .map((e: any) => ({ value: e.id, label: e.fullName+' ('+e.customerCode+')' })),
                ...members.filter((e) => e.selected === true),
            ]);
            setMemberLoader(false)
        }).catch((e) => {
            setMemberLoader(false)
            console.log(e.message)
        })
    }

    const handleMemberChange = (_members) => {
        setValue('memberIds', _members.map((e) => e.value))
        setMembers(members.map((e) => {
            e.selected = _members.some((_e) => _e.value === e.value)
            return e
        }))
        if(_members.length){
            clearErrors('memberIds')
        }
    };

    const onSubmit = async (data) => {
        delete data?.brand
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

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
                <Box sx={{mb:2, pt: 1}}>
                    <Autocomplete
                        id="customer-dd"
                        options={customers}
                        value={customerId}
                        loading={customerLoader}
                        onInput={(event) => setSearchCustomer(event.target.value)}
                        getOptionLabel={(option) => option.label || ''}
                        onChange={handleCustomerChange}
                        readOnly={!bookingPermission}
                        renderInput={(params) => <FormInput fullWidth={true} label={'Customer'} placeholder={'Search customers'} params={params}
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <Fragment>
                                            {contractLoader ? <CircularProgress color="primary" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </Fragment>
                                    ),
                                },
                            }}
                        />}
                    />
                </Box>
                <Box sx={{mb:2}}>
                    <Controller name="sessionContractId" control={control}
                        rules={{
                            required: {
                                value: "required",
                                message: "Contract is required"
                            }
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <Autocomplete
                                id="contracts-dd"
                                options={contracts}
                                getOptionLabel={(option) => option.label || ''}
                                value={contractId}
                                loading={contractLoader}
                                onChange={handleContractChange}
                                readOnly={!bookingPermission}
                                renderInput={(params) => <FormInput fullWidth={true} disabled={!contracts.length || !customerId?.value} error={error} label={'Contract'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {contractLoader ? <CircularProgress color="primary" size={20} /> : null}
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
                    contractId?.serviceType === SERVICE_TYPE.GROUP_SESSION ?
                        <Box sx={{mb:2}}>
                            <Controller name="memberIds" control={control}
                                rules={{
                                    validate: (value) => {
                                        if (contractId?.serviceType === SERVICE_TYPE.GROUP_SESSION && isEmpty(value)) {
                                            return "Group member is required";
                                        }
                                        return true;
                                    }
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        multiple
                                        id="checkboxes-members"
                                        options={members}
                                        value={members.filter((e) => e.selected === true)}
                                        loading={memberLoader}
                                        disableCloseOnSelect
                                        freeSolo={true}
                                        readOnly={!bookingPermission}
                                        onInput={(event) => setSearchMember(event.target.value)}
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
                                        renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Members'} placeholder={isEmpty(field.value) ? 'Search members' : ''} params={params}
                                            slotProps={{
                                                input: {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <Fragment>
                                                            {memberLoader ? <CircularProgress color="inherit" size={20} /> : null}
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
                    { !contractId?.instructorId ?
                        <Controller name="instructorId" control={control}
                            rules={{
                                required: {
                                    value: "required",
                                    message: "Instructor is required"
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <Autocomplete
                                    id="instructor-dd"
                                    options={instructors}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={instructorId}
                                    onChange={handleInstructorChange}
                                    disabled={!instructors.length || defaultValues?.isFree === false}
                                    readOnly={!bookingPermission}
                                    renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Instructor'} params={params}/>}
                                />
                            )}
                        /> : <></>
                    }
                </Box>
                <Box sx={{mb:2}}>
                    <Controller name="sessions.forDate" control={control}
                        rules={{
                            required: {
                                value: "required",
                                message: "Booking date is required"
                            }
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <FormControl error={!!error} fullWidth={true}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Booking date"
                                        closeOnSelect={true}
                                        value={field.value ? dayjs(field.value) : null}
                                        readOnly={!bookingPermission}
                                        format="MMM DD, YYYY"
                                        minDate={dayjs()}
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
                <Box sx={{mb:2}}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller name={`sessions.openTime`} control={control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Start time is required"
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            label={'Start time'}
                                            closeOnSelect
                                            value={field.value ? dayjs(`${forDate}T${field.value}`) : null}
                                            onChange={(newValue) => handleOpenTimeChange(newValue)}
                                            readOnly={!bookingPermission}
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
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller name={`sessions.closeTime`} control={control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "End time is required"
                                    }
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl error={!!error} fullWidth={true}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label={'End time'}
                                                closeOnSelect
                                                readOnly={true}
                                                value={field.value ? dayjs(`${forDate}T${field.value}`) : null}
                                                onChange={(newValue) => handleEndTimeChange(newValue)}
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
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    sx={{
                        mt: 3,
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                        justifyContent: { xs: 'stretch', sm: 'flex-end' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    { defaultValues.attend === PT_SESSION_ATTEND_STATUS.BOOKED && dayjs().format('YYYY-MM-DD') >= defaultValues.sessions.forDate ?
                        <Button onClick={() => attendCallback(defaultValues.id)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Attend</Button>
                        :<></>
                    }
                    { bookingPermission && defaultValues?.id && defaultValues?.attend === PT_SESSION_ATTEND_STATUS.BOOKED ?
                        <Button color={'error'} onClick={() => unbookCallback(defaultValues.id)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Remove</Button>
                        :<></>
                    }
                    { bookingPermission ?
                        <LoadingButton
                            variant="contained"
                            type="submit"
                            loading={loading}
                            disabled={loading || (contractId?.remainingSessions === 0 && !defaultValues?.id) || (defaultValues.attend && defaultValues.attend !== PT_SESSION_ATTEND_STATUS.BOOKED)}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            {btnLabel}
                        </LoadingButton>
                        :<></>
                    }
                </Box>
            </Box>
        </form>
    )

}

export default ContractBooking