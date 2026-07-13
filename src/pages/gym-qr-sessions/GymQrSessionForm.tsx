import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import {Box, Checkbox, Button, FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText, InputLabel, MenuItem} from "@mui/material";
import dayjs from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import {Fragment, useCallback, useEffect, useState, memo} from "react";
import CircularProgress from "@mui/material/CircularProgress";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {debounce} from "@mui/material/utils";
import {GetCustomers} from "../../services/customer.service";
import {isEmpty,capitalize} from "lodash";
import Grid from "@mui/material/Grid2";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import {GYM_QR_SESSION_STATE} from "../../utils/constants";
import Select from "@mui/material/Select";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

enum ProfileType  {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER'
}

const GymQrSessionForm = memo(({loading, gymId, close, _admins,callback}) => {

    const [profileType, setProfileType] = useState(ProfileType.CUSTOMER)

    const [customers, setCustomers] = useState([]);
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");

    const [admins, setAdmins] = useState(() => structuredClone(_admins));

    const defaultValues = {
        gymId,
        adminIds: [],
        customerIds: [],
        bioDate: dayjs().format('YYYY-MM-DD'),
        bioTime: dayjs(),
        state: ''
    }

    const {control, handleSubmit, setValue, clearErrors} = useForm({
        mode: "onChange",
        defaultValues
    })

    const handleAdminChange = (_admins) => {
        setValue('adminIds', _admins.map((e) => e.value))
        setAdmins(admins.map((e:any) => {
            e.selected = _admins.some((_e) => _e.value === e.value)
            return e
        }))
        if(_admins.length){
            clearErrors('adminIds')
        }
    };

    const handleCustomerChange = (_customers) => {
        setValue('customerIds', _customers.map((e) => e.value))
        setCustomers(customers.map((e) => {
            e.selected = _customers.some((_e) => _e.value === e.value)
            return e
        }))
        if(_customers.length){
            clearErrors('customerIds')
        }
    };

    const fetchCustomers = (searchCustomer,customers) => {
        setCustomerLoader(true)
        GetCustomers({page:1}, {gymId, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            setCustomers([
                ...list.map((e: any) => ({ value: e.id, label: e.fullName+' ('+e.customerCode+')' })),
                ...customers.filter((e) => e.selected === true),
            ]);
            setCustomerLoader(false)
        }).catch((e) => {
            setCustomerLoader(false)
            console.log(e.message)
        })
    }

    const handleBioTimeChange = (newValue) => {
        setValue('bioTime', newValue);
    };

    const debouncedFetchCustomer = useCallback(
        debounce((searchCustomer,customers) => fetchCustomers(searchCustomer,customers), 500),
        []
    );

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer, customers)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    useEffect(() => {
        setAdmins(structuredClone(_admins));
    }, [_admins]);

    const onSubmit = (data) => {
        callback(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
                <ProgressBar formLoader={loading}/>
                <Box>
                    <Box sx={{mb:2}}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="bioDate" control={control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Date is required"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Date"
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
                                <Controller name={`bioTime`} control={control}
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
                                                onChange={(newValue) => handleBioTimeChange(newValue)}
                                                value={field.value ? dayjs(field.value) : null}
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
                                <Controller name="state" control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "State is required",
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                            <InputLabel>State</InputLabel>
                                            <Select row {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value)}>
                                                { Object.keys(GYM_QR_SESSION_STATE).map((key) => {
                                                    return (<MenuItem value={key} key={key}>{GYM_QR_SESSION_STATE[key]}</MenuItem>)
                                                }) }
                                            </Select>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl sx={{ mt: { xs: 0, sm: 1.5 }, width: '100%' }}>
                                    <RadioGroup
                                        value={profileType}
                                        onChange={(e) => setProfileType(e.target.value)}
                                        sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                                    >
                                        <FormControlLabel value={ProfileType.CUSTOMER} control={<Radio />} label={capitalize(ProfileType.CUSTOMER)} />
                                        <FormControlLabel value={ProfileType.ADMIN} control={<Radio />} label={capitalize(ProfileType.ADMIN)} />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{mb:2}}>
                        { profileType === ProfileType.CUSTOMER ?
                            <Controller name="customerIds" control={control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Customer(s) is required"
                                    }
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        multiple
                                        id="checkboxes-customers"
                                        options={customers}
                                        value={customers.filter((e) => e.selected === true)}
                                        loading={customerLoader}
                                        disableCloseOnSelect
                                        freeSolo={true}
                                        onInput={(event) => setSearchCustomer(event.target.value)}
                                        getOptionLabel={(option) => option.label}
                                        onChange={(event, newValue) => {
                                            field.onChange(newValue);
                                            handleCustomerChange(newValue);
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
                                        renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Customers'} placeholder={isEmpty(field.value) ? 'Search customers' : ''} params={params}
                                            slotProps={{
                                                input: {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <Fragment>
                                                            {customerLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </Fragment>
                                                    ),
                                                },
                                            }}
                                        />}
                                    />
                                )}
                            />
                            :
                            <Controller name="adminIds" control={control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Admin(s) is required"
                                    }
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        multiple
                                        id="checkboxes-admins"
                                        options={admins}
                                        value={admins.filter((e) => e.selected === true)}
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => option.label}
                                        onChange={(event, newValue) => {
                                            field.onChange(newValue);
                                            handleAdminChange(newValue);
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
                                        renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Admin'} params={params}/>}
                                    />
                                )}
                            />
                        }
                    </Box>
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column-reverse', sm: 'row' },
                            justifyContent: { xs: 'stretch', sm: 'flex-end' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 1,
                        }}
                    >
                        <Button onClick={close} sx={{ width: { xs: '100%', sm: 'auto' } }}>CANCEL</Button>
                        <LoadingButton
                            variant="contained"
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Mark Now
                        </LoadingButton>
                    </Box>
                </Box>
            </Box>
        </form>
    )
})

export default GymQrSessionForm