import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Box, Button,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText, InputLabel, MenuItem, Checkbox
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import {grey} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Link from "@mui/material/Link";
import {NavLink} from "react-router-dom";
import {DISCOUNT_TYPE, GYM_CLASS_STATUS, ORDER_TYPE, PAYMENT_METHOD, PERMISSIONS, ROUTES} from "../../utils/constants";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import Grid from "@mui/material/Grid2";
import * as React from "react";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {useTheme} from "@mui/material/styles";
import {Fragment, useCallback, useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Paper, {PaperProps} from "@mui/material/Paper";
import Draggable from "react-draggable";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CloseIcon from "@mui/icons-material/Close";
import {TransitionProps} from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import {Controller, useForm} from "react-hook-form";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {debounce} from "@mui/material/utils";
import {GetCustomers} from "../../services/customer.service";
import LoadingButton from "@mui/lab/LoadingButton";
import Select from "@mui/material/Select";
import {isEmpty} from "lodash";
import {BillingTotal} from "../../services/payment.service";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import {hasPermission} from "../../utils/permissions";

function BookingPaperComponent(props: PaperProps) {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
            handle="#draggable-book-member-component"
            cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} ref={nodeRef} />
        </Draggable>
    );
}

function ReschedulePaperComponent(props: PaperProps) {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
            handle="#draggable-reschedule-component"
            cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} ref={nodeRef} />
        </Draggable>
    );
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ClassBooking({classDialog, gymId, gymClass, loading, classMembers, handleClassDialogClose, paymentLoader, bookingOnSubmit, rescheduleOnSubmit, instructors, rescheduleLoader, markDone, markDoneLoader, attendanceLoader, markAttendance}) {
    const theme = useTheme();
    const [rows, setRows] = useState(classMembers);
    const BFDefaultValues = {
        bookedFor: gymClass.date,
        bookedTill: "",
        customerId: "",
        paymentMethod: '',
    }
    const RSDefaultValues = {
        scheduleId: "",
        scheduleGroupId: "",
        oldDate: "",
        oldTime: "",
        modifiedDate: "",
        modifiedTime: "",
        spots: "",
        duration: "",
        instructorIds: [],
    }

    const bookingForm = useForm({ mode: "onChange", defaultValues: BFDefaultValues})
    const rescheduleForm = useForm({ mode: "onChange", defaultValues: RSDefaultValues})

    const bookedFor = bookingForm.watch('bookedFor')
    const bookedTill = bookingForm.watch('bookedTill')
    /**
    * Class Booking
    * */
    const [bookMemberDialog, setBookMemberDialog] = useState(false);
    const [bookingOption, setBookingOption] = useState('SINGLE');
    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState({});
    const [customerLoader, setCustomerLoader] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [billingLoader, setBillingLoader] = useState(false);
    const [billing, setBilling] = useState({});
    const [selected, setSelected] = useState([]);
    const [attendanceDialog, setAttendanceDialog] = useState(false);
    const [isAttendable, setIsAttendable] = useState(true);
    /**
     * Reschedule Class
     * */
    const [rescheduleDialog, setRescheduleDialog] = useState(false);
    const [rescheduleInstructors, setRescheduleInstructors] = useState([]);
    /**
     * Mark Done
     * */
    const [markDoneDialog, setMarkDoneDialog] = useState(false);

    const columns = [
        { id: "checkbox", label: "", maxWidth: 50, align: "center" },
        { id: 'customerName', label: 'Member', minWidth: 170 },
        { id: 'customerCode', label: 'Customer Code', minWidth: 170 },
        { id: 'isPurchased', label: 'Payment', minWidth: 170, align: 'center' },
        { id: 'isAttended', label: 'Attendance', minWidth: 170, align: 'center' },
        { id: 'action', label: 'Action', minWidth: 170 },
    ]

    const actionBtnStyles = (type) => {
        return { mr:1, backgroundColor: type+'.main', color: 'white', '&:hover': { backgroundColor: type+'.dark' } }
    }

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allIds = rows.map((row) => row.id);
            setSelected(allIds);
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelected((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((customerId) => customerId !== id)
                : [...prevSelected, id]
        );
    };

    const handleOpenBookMemberDialog = () => {
        setBilling({})
        setCustomerId({})
        bookingForm.reset(BFDefaultValues)
        setBookMemberDialog(true)
    }

    const handleCloseRescheduleDialog = () => {
        rescheduleForm.reset(RSDefaultValues)
        setRescheduleDialog(false)
    }

    const handleOpenRescheduleDialog = () => {
        const startTime = dayjs(`${gymClass.date} ${gymClass.openTime}`);
        const endTime = dayjs(`${gymClass.date} ${gymClass.closeTime}`);
        rescheduleForm.reset({
            scheduleId: gymClass.scheduleId,
            scheduleGroupId: gymClass.scheduleGroupId,
            oldDate: gymClass.date,
            oldTime: gymClass.openTime,
            spots: gymClass.spotsCapacity,
            duration: endTime.diff(startTime, 'minute'),
            status: GYM_CLASS_STATUS.ACTIVE,
            instructorIds: gymClass.instructors.map((e:any) => e.id)
        })
        setRescheduleInstructors(() =>
            instructors.map((e: any) => ({
                value: e.value,
                label: e.label,
                selected: gymClass.instructors.some((_e) => _e.id === e.value)
            }))
        )
        setRescheduleDialog(true)
    }

    const handleOpenMarkClassDoneDialog = () => {
        setMarkDoneDialog(true)
    }

    const handleCloseMarkClassDoneDialog = () => {
        setMarkDoneDialog(false)
    }

    const _markDone = () => {
        const startTime = dayjs(`${gymClass.date} ${gymClass.openTime}`);
        const endTime = dayjs(`${gymClass.date} ${gymClass.closeTime}`);
        markDone({
            scheduleId: gymClass.scheduleId,
            scheduleGroupId: gymClass.scheduleGroupId,
            oldDate: gymClass.date,
            modifiedDate: gymClass.date,
            oldTime: gymClass.openTime,
            modifiedTime: gymClass.openTime,
            spots: gymClass.spotsCapacity,
            duration: endTime.diff(startTime, 'minute'),
            status: GYM_CLASS_STATUS.DONE,
            instructorIds: gymClass.instructors.map((e:any) => e.id)
        }, handleCloseMarkClassDoneDialog)
    }

    const handleOpenAttendanceDialog = () => {
        setAttendanceDialog(true)
    }

    const handleCloseAttendanceDialog = () => {
        setAttendanceDialog(false)
    }

    const _markAttendance = () => {
        markAttendance(selected, handleCloseAttendanceDialog)
    }

    const loadInvoice = () => {
        setBillingLoader(true)
        const params = {
            orderType: ORDER_TYPE.GYM_CLASS,
            scheduleId:gymClass.scheduleId,
            scheduleGroupId:gymClass.scheduleGroupId,
            bookedFor, bookedTill, customerId:customerId?.value,
            bookedTime:gymClass.openTime,
        }
        BillingTotal(params).then((e) => {
            setBillingLoader(false)
            setBilling(e)
        }).catch(() => {
            setBillingLoader(false)
        })
    }

    const handleCloseBookMemberDialog = () => {
        setCustomers([])
        setBookMemberDialog(false)
    }

    const handleCustomerChange = (event: any, value: { value: string, label: string } | null) => {
        bookingForm.setValue('customerId', value?.value)
        setCustomerId({label: value?.label, value: value?.value})
    }

    const handleRescheduleInstructorChange = (newValue) => {
        rescheduleForm.setValue('instructorIds', newValue.map((e) => e.value))
        setRescheduleInstructors(() =>
            instructors.map((e: any) => ({
                value: e.value,
                label: e.label,
                selected: newValue.some((_e) => _e.value === e.value)
            }))
        )
    }

    const handleRescheduleTimeChange = (newValue) => {
        rescheduleForm.setValue('modifiedTime', newValue.format('HH:mm:ss'));
    }

    const fetchCustomers = ({searchCustomer, gymId, rows}) => {
        setCustomerLoader(true)
        GetCustomers({page:1}, {gymId, searchText: searchCustomer}).then((response:any) => {
            const { list } = response
            setCustomers(list.map((e) => {
                return {
                    value: e.id,
                    label: e.fullName+' ('+e.customerCode+')',
                    disabled: rows.some((c) => c.id === e.id)
                }
            }))
            setCustomerLoader(false)
        }).catch((e) => {
            setCustomerLoader(false)
            console.log(e.message)
        })
    }

    const _bookingOnSubmit = (data) => {
        bookingOnSubmit(data, handleCloseBookMemberDialog)
    }

    const _rescheduleOnSubmit = (data) => {
        rescheduleOnSubmit(data, handleCloseRescheduleDialog)
    }

    const debouncedFetchCustomer = useCallback(
        debounce((searchCustomer, gymId, rows) => fetchCustomers({searchCustomer, gymId, rows}), 500),
        []
    );

    useEffect(() => {
        if (searchCustomer){
            debouncedFetchCustomer(searchCustomer, gymId, rows)
        }
    }, [searchCustomer, debouncedFetchCustomer]);

    useEffect(() => {
        setRows(classMembers)
    },[classMembers])

    useEffect(() => {
        setSelected([])
        setIsAttendable(dayjs(gymClass.date).isBefore(dayjs(), 'day') || dayjs(gymClass.date).isSame(dayjs(), 'day'))
    },[classDialog])

    useEffect(() => {
        if(customerId?.value){
            loadInvoice()
        }
    },[customerId,bookedTill])

    return (
        <Box>
            <Fragment>
                <Dialog open={bookMemberDialog} aria-hidden={!bookMemberDialog} aria-labelledby="draggable-book-member-component" onClose={handleCloseBookMemberDialog} PaperComponent={BookingPaperComponent}>
                    <DialogTitle>Class Booking</DialogTitle>
                    <DialogContent>
                        <Box sx={{width: 400}}>
                            <form onSubmit={bookingForm.handleSubmit(_bookingOnSubmit)}>
                                <FormControl>
                                    <FormLabel>Choose Booking Option</FormLabel>
                                    <RadioGroup row value={bookingOption} onChange={(e) => setBookingOption(e.target.value)}>
                                        <FormControlLabel value={'SINGLE'} control={<Radio />} label="Single" />
                                        <FormControlLabel value={'MULTIPLE'} control={<Radio />} label="Multiple" />
                                    </RadioGroup>
                                </FormControl>
                                <Controller name="customerId" control={bookingForm.control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Customer is required"
                                        }
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <Autocomplete
                                            id="customer-dd"
                                            options={customers}
                                            value={customerId}
                                            loading={customerLoader}
                                            onInput={(event) => setSearchCustomer(event.target.value)}
                                            getOptionDisabled={(option) => option.disabled}
                                            getOptionLabel={(option) => option.label || ''}
                                            onChange={handleCustomerChange}
                                            renderInput={(params) => <FormInput fullWidth={true} label={'Customer'} error={error} placeholder={'Search customers'} params={params} sx={{mb:2}}
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <Fragment>
                                                                {customerLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </Fragment>
                                                        ),
                                                    },
                                                }}
                                            />}
                                        />
                                    )}
                                />
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Controller name="bookedFor" control={bookingForm.control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Booking Date is required"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormControl error={!!error} fullWidth={true} sx={{mb:2}}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            label="Booking date"
                                                            closeOnSelect={true}
                                                            value={field.value ? dayjs(field.value) : null}
                                                            format="MMM DD, YYYY"
                                                            readOnly={true}
                                                            onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                            minDate={dayjs()}
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
                                    <Grid size={6}>
                                        { bookingOption === 'MULTIPLE' ?
                                            <Controller name="bookedTill" control={bookingForm.control}
                                                rules={{
                                                    required: {
                                                        value: "required",
                                                        message: "Booking till is required"
                                                    },
                                                    validate: (value) => {
                                                        if (bookingOption === 'MULTIPLE' && value && bookedFor > value ) {
                                                            return "Must be later than the booking date.";
                                                        }
                                                        return true;
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <FormControl error={!!error} fullWidth={true} sx={{mb:2}}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                label="Booking till"
                                                                closeOnSelect={true}
                                                                value={field.value ? dayjs(field.value) : null}
                                                                format="MMM DD, YYYY"
                                                                onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                                minDate={bookedFor ? dayjs(bookedFor) : dayjs()}
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
                                            :<LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <TimePicker
                                                    label={'Time'}
                                                    readOnly={true}
                                                    closeOnSelect
                                                    value={gymClass.openTime ? dayjs(`${gymClass.date}T${gymClass.openTime}`) : null}
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'standard',
                                                            sx: { width: '100%' }
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        }
                                    </Grid>
                                </Grid>
                                <Controller name="paymentMethod" control={bookingForm.control}
                                    rules={{
                                        required: {
                                            value: "required",
                                            message: "Payment method is required"
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                            <InputLabel>Payment method</InputLabel>
                                            <Select label="Payment method" {...field} value={field.value || ''} error={!!error}>
                                                { Object.keys(PAYMENT_METHOD).map((key:string) => {
                                                    return (<MenuItem value={key} key={key}>{PAYMENT_METHOD[key]}</MenuItem>)
                                                }) }
                                            </Select>
                                            {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                                {
                                    billingLoader ?
                                        <Box sx={{textAlign: 'center', mt: 2}}>
                                            <CircularProgress/>
                                        </Box>
                                        :<TableContainer sx={{mb: 2}}>
                                            {
                                                !isEmpty(billing) ?
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{color: 'primary.main'}}>Class</TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>Unit
                                                                    Price</TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>Qty</TableCell>
                                                                <TableCell sx={{color: 'primary.main'}}>Line
                                                                    Total</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                billing.items.map((e) => {
                                                                    return (
                                                                        <TableRow key={Math.random()}>
                                                                            <TableCell>{e.name}</TableCell>
                                                                            <TableCell>{billing.currency + e.price}</TableCell>
                                                                            <TableCell>{e.qty}</TableCell>
                                                                            <TableCell>{billing.currency + e.total}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })
                                                            }
                                                            <TableRow>
                                                                <TableCell colSpan={3}
                                                                           sx={{fontWeight: 'bold'}}>Subtotal</TableCell>
                                                                <TableCell
                                                                    sx={{fontWeight: 'bold'}}>{billing.currency + billing.subtotal}</TableCell>
                                                            </TableRow>
                                                            {
                                                                billing.discount ?
                                                                    <TableRow>
                                                                        <TableCell colSpan={3}>
                                                                            Discount{" "}
                                                                            {billing.discount.discountType === DISCOUNT_TYPE.PERCENTAGE
                                                                                ? `${billing.discount.percentage}%${billing.discount.isCapped ? " - Capped" : ""}`
                                                                                : ""}
                                                                        </TableCell>
                                                                        <TableCell>{billing.currency + billing.discount.discountAmount}</TableCell>
                                                                    </TableRow>
                                                                    : <></>
                                                            }
                                                            {
                                                                billing.tax.amount ?
                                                                    <TableRow>
                                                                        <TableCell
                                                                            colSpan={3}>{billing.tax.name} ({billing.tax.rate}%)</TableCell>
                                                                        <TableCell>{billing.currency + billing.tax.amount}</TableCell>
                                                                    </TableRow>
                                                                    : <></>
                                                            }
                                                            <TableRow>
                                                                <TableCell colSpan={3} sx={{fontWeight: 'bold'}}>Grand
                                                                    Total</TableCell>
                                                                <TableCell
                                                                    sx={{fontWeight: 'bold'}}>{billing.currency + billing.invoiceAmount}</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                : <></>
                                            }
                                        </TableContainer>
                                }
                                <Box sx={{textAlign: 'right'}}>
                                    <LoadingButton variant="contained" type="submit" loading={paymentLoader} disabled={paymentLoader}>Proceed Payment</LoadingButton>
                                </Box>
                            </form>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={rescheduleDialog} aria-hidden={!rescheduleDialog} aria-labelledby="draggable-reschedule-component" onClose={handleCloseRescheduleDialog} PaperComponent={ReschedulePaperComponent}>
                    <DialogTitle>Reschedule Class Booking</DialogTitle>
                    <DialogContent>
                        <Box sx={{width: 400}}>
                            <form onSubmit={rescheduleForm.handleSubmit(_rescheduleOnSubmit)}>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Controller name="modifiedDate" control={rescheduleForm.control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Rescheduled Date is required"
                                                },
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormControl error={!!error} fullWidth={true}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            label="Rescheduled Date"
                                                            closeOnSelect={true}
                                                            value={field.value ? dayjs(field.value) : null}
                                                            format="MMM DD, YYYY"
                                                            minDate={dayjs()}
                                                            maxDate={gymClass.endDate ? dayjs(gymClass.endDate) : undefined}
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
                                    <Grid size={6}>
                                        <Controller name="modifiedTime" control={rescheduleForm.control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Rescheduled Time is required"
                                                },
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormControl error={!!error} fullWidth={true}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker
                                                            label={'Rescheduled Time'}
                                                            closeOnSelect
                                                            onChange={(newValue) => handleRescheduleTimeChange(newValue)}
                                                            slotProps={{
                                                                textField: {
                                                                    variant: 'standard',
                                                                    sx: { width: '100%' }
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                    {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Controller name={`instructorIds`} control={rescheduleForm.control}
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
                                            options={rescheduleInstructors || []}
                                            value={rescheduleInstructors?.filter((e) => e.selected === true) || []}
                                            disableCloseOnSelect
                                            getOptionLabel={(option) => option.label}
                                            onChange={(event, newValue) => {
                                                field.onChange(newValue);
                                                handleRescheduleInstructorChange(newValue);
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
                                            renderInput={(params) => <FormInput fullWidth={true} error={error} label={'Instructor(s)'} sx={{my:2}}  params={params}/>}
                                        />
                                    )}
                                />
                                <Box sx={{textAlign: 'right'}}>
                                    <LoadingButton variant="contained" type="submit" loading={rescheduleLoader} disabled={rescheduleLoader}>Reschedule</LoadingButton>
                                </Box>
                            </form>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog open={markDoneDialog} aria-hidden={!markDoneDialog} onClose={handleCloseMarkClassDoneDialog}>
                    <DialogTitle>Mark Done</DialogTitle>
                    <DialogContent>
                        <Box sx={{width: 400, mb:2}}>
                            <Typography variant="subtitle1" component="div">Are you sure to mark this class done ?</Typography>
                        </Box>
                        <Box sx={{textAlign: 'right'}}>
                            <Button sx={{mr:1}} onClick={handleCloseMarkClassDoneDialog}>Not now</Button>
                            <LoadingButton variant="contained" onClick={_markDone} type="button" loading={markDoneLoader} disabled={markDoneLoader}>Mark Done</LoadingButton>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog
                    open={attendanceDialog}
                    aria-hidden={!attendanceDialog}
                    onClose={handleCloseAttendanceDialog}
                    fullWidth
                    maxWidth="xs"
                    sx={{
                        '& .MuiDialog-paper': {
                            m: { xs: 1.5, sm: 2 },
                            width: { xs: 'calc(100% - 24px)', sm: undefined },
                        },
                    }}
                >
                    <DialogTitle sx={{ px: { xs: 2, sm: 3 } }}>Attendance</DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <Typography variant="subtitle1" component="div">Are you sure to mark <strong>({selected.length}) selected</strong> attendances ?</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column-reverse', sm: 'row' },
                                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                                gap: 1,
                            }}
                        >
                            <Button onClick={handleCloseAttendanceDialog} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                            <LoadingButton
                                variant="contained"
                                onClick={_markAttendance}
                                type="button"
                                loading={attendanceLoader}
                                disabled={attendanceLoader}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                Mark Attendance
                            </LoadingButton>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <Fragment>
                <Dialog fullScreen open={classDialog} onClose={handleClassDialogClose} TransitionComponent={Transition}>
                    <AppBar sx={{ position: 'relative', backgroundColor: theme.palette.triadic.dark }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClassDialogClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">{gymClass.title+' ('+gymClass.spotsAllotted+'/'+gymClass.spotsCapacity+')'}</Typography>
                        </Toolbar>
                    </AppBar>
                    <Grid container sx={{ height: '100%' }}>
                        <Grid size={9}>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell key={'checkbox-select-all'} align={'left'} style={{ maxWidth: 50 }}>
                                                <Checkbox
                                                    indeterminate={selected.length > 0 && selected.length < rows.length}
                                                    checked={selected.length === rows.length && rows.length > 0}
                                                    disabled={!isAttendable}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            {columns.slice(1).map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column?.align}
                                                    style={{ minWidth: column.minWidth }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <>
                                            {rows.map((row) => (
                                                <TableRow
                                                    hover
                                                    role="checkbox"
                                                    key={row.customerCode}
                                                    sx={{ opacity: loading ? 0.2 : 1 }}
                                                >
                                                    <TableCell align="center">
                                                        <Checkbox
                                                            checked={selected.includes(row.id) || row._isAttended}
                                                            disabled={row._isAttended || !isAttendable}
                                                            onChange={() => handleSelectRow(row.id)}
                                                        />
                                                    </TableCell>
                                                    {columns.slice(1).map((column) => {
                                                        const value = row[column.id];
                                                        return <TableCell key={column.id} align={column.align}>{value}</TableCell>;
                                                    })}
                                                </TableRow>
                                            ))}
                                            <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                            <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                        </>
                                    </TableBody>
                                    <TableFooter>
                                        {loading ? <TableSpinner colSpan={columns.length}/> : <></>}
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid size={3} sx={{ height: '100%', zIndex: 2,backgroundColor: theme.palette.mode === 'dark' ? grey[900] : grey[200], boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);' }} >
                            <TableContainer sx={{ maxHeight: 440, p:1 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell width={10}>
                                                <Tooltip title="Date" placement={'left'}>
                                                    <TodayOutlinedIcon sx={{marginTop:'5px', color: theme.palette.triadic.dark }}/>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell><Typography variant="subtitle2">{dayjs(gymClass.date).format("MMM DD, YYYY")}</Typography></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell width={10}>
                                                <Tooltip title="Time" placement={'left'}>
                                                    <AccessTimeIcon sx={{marginTop:'5px', color: theme.palette.triadic.dark}}/>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell><Typography variant="subtitle2">{dayjs(gymClass.date+' '+gymClass.openTime).format("hh:mm A")} - {dayjs(gymClass.date+' '+gymClass.closeTime).format("hh:mm A")}</Typography></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell width={10}>
                                                <Tooltip title="Instructor(s)" placement={'left'}>
                                                    <AccountCircleOutlinedIcon sx={{marginTop:'5px', color: theme.palette.triadic.dark}}/>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {gymClass.instructors?.map((instructor) => (
                                                    <Typography key={instructor.id} variant="subtitle2">
                                                        <Link component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(instructor.id)} color={'inherit'} underline="none">{instructor.fullName}</Link>
                                                    </Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell width={10}>
                                                <Tooltip title="Slot Booking" placement={'left'}>
                                                    <StyleOutlinedIcon sx={{marginTop:'5px',color: theme.palette.triadic.dark}}/>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell><Typography  variant="subtitle2">{gymClass.spotsAllotted+'/'+gymClass.spotsCapacity}</Typography></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{px:3, pt:1}}>
                                <Typography variant="subtitle2">Appointments actions</Typography>
                                <Box sx={{mt:2}}>
                                    { hasPermission(PERMISSIONS.CLASS.PURCHASE) ?
                                        <Tooltip title="Book Member" placement={'bottom'}>
                                            <Box component={'span'} sx={{display: 'inline-block'}}>
                                                <IconButton onClick={handleOpenBookMemberDialog} disabled={dayjs(gymClass.date).isBefore(dayjs(), 'day') || gymClass.status === GYM_CLASS_STATUS.DONE} sx={actionBtnStyles('primary')}><AddIcon/></IconButton>
                                            </Box>
                                        </Tooltip> : <></>
                                    }
                                    { hasPermission(PERMISSIONS.CLASS_SCHEDULE.MODIFY) ?
                                        <>
                                            <Tooltip title="Reschedule Class" placement={'bottom'}>
                                                <Box component={'span'} sx={{display: 'inline-block'}}>
                                                    <IconButton onClick={handleOpenRescheduleDialog} disabled={dayjs(gymClass.date).isBefore(dayjs(), 'day') || gymClass.status === GYM_CLASS_STATUS.DONE} sx={actionBtnStyles('warning')}><UpdateIcon/></IconButton>
                                                </Box>
                                            </Tooltip>
                                        </>
                                         : <></>
                                    }
                                    { hasPermission(PERMISSIONS.CLASS_SCHEDULE.MARK_DONE) ?
                                        <Tooltip title="Mark Done" placement={'bottom'}>
                                            <Box component={'span'} sx={{display: 'inline-block'}}>
                                                <IconButton onClick={handleOpenMarkClassDoneDialog} sx={actionBtnStyles('success')} disabled={dayjs(gymClass.date).isAfter(dayjs(), 'day') || gymClass.status === GYM_CLASS_STATUS.DONE}><TaskAltOutlinedIcon/></IconButton>
                                            </Box>
                                        </Tooltip>: <></>
                                    }
                                    { hasPermission(PERMISSIONS.CLASS_SCHEDULE.ATTEND) ?
                                        <Tooltip title="Mark Attendance" placement={'bottom'}>
                                            <Box component={'span'} sx={{display: 'inline-block'}}>
                                                <IconButton onClick={handleOpenAttendanceDialog} disabled={!selected.length} sx={actionBtnStyles('triadic')}><PersonAddAltOutlinedIcon/></IconButton>
                                            </Box>
                                        </Tooltip>: <></>
                                    }
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Dialog>
            </Fragment>
        </Box>
    )
}

export default ClassBooking