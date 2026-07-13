import * as React from "react";
import {Fragment, useContext, useEffect, useRef, useState} from "react";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import {Box, Link, useMediaQuery} from '@mui/material'
import {GLOBAL_STATUSES, GYM_CLASS_STATUS, ORDER_TYPE, PERMISSIONS, PT_SESSION_ATTEND_STATUS, ROLE, ROUTES} from "../../utils/constants";
import {AdminContext} from "../../hooks/AdminContext";
import {getAuthGym, hasPermission, hasRole} from "../../utils/permissions";
import {AllBookedPTSessions, BookAPrivateCoach, CancelPTBooking, UpdateABooking} from "../../services/order.private.coach.service";
import {AllBookedPTClassSessions, AttendBookedGymClass, BuyAGymClass, ModifyGymClassSchedule} from "../../services/order.gym.class.service";
import {GetGyms} from "../../services/gym.service";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import {GetInstructors} from "../../services/instructor.service";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ContractBooking from "./ContractBooking";
import {ToastContext} from "../../hooks/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import Draggable from 'react-draggable';
import Paper, {PaperProps} from '@mui/material/Paper';
import {cloneDeep} from 'lodash';
import AppDialog from "../../components/AppDialog";
import {AttendPTSession} from "../../services/attend.session.service";
import {GymClassesListing} from "../../services/class.schedule.service";
import { useTheme } from '@mui/material/styles';
import ClassBooking from './ClassBooking';
import {NavLink} from "react-router-dom";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

interface AllPTSessionInput {
    gymId: string,
    startDate: string,
    endDate: string,
    instructorId?: string,
}

interface ClassDialogView {
    date: string,
    endDate: string,
    title: string,
    status: string,
    openTime: string,
    closeTime: string,
    instructors: any,
    spotsAllotted: string,
    spotsCapacity: string,
    scheduleId: string,
    scheduleGroupId: string,
}

interface ClassMemberInput {
    date: string,
    gymId: string,
    openTime: string,
    scheduleId: string,
    scheduleGroupId: string
}

function PaperComponent(props: PaperProps) {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} ref={nodeRef} />
        </Draggable>
    );
}

function Calendar() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const adminContext = useContext(AdminContext)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [gyms, setGyms] = useState([]);
    const [loader, setLoader] = useState(false);
    const [gymLoader, setGymLoader] = useState(false);
    const [gymId, setGymId] = useState(gymSelection ? {} : {label: '', value: getAuthGym()} )
    const [instructorLoader, setInstructorLoader] = useState(false);
    const [instructorId, setInstructorId] = useState({});
    const [instructors, setInstructors] = useState([]);
    const calendarRef = useRef<FullCalendar | null>(null);
    const [createBookingModal, setCreateBookingModal] = useState(false);
    const [bookingLoader, setBookingLoader] = useState(false);
    const [title, setTitle] = useState('')
    const [btnLabel, setBtnLabel] = useState('')
    const [events, setEvents] = useState([])
    /**
     * Cancellation of PT Booking
     * */
    const [unbookDialog, setUnbookDialog] = useState(false)
    const [removePTBookingLoader, setRemovePTBookingLoader] = useState(false)
    const [deleteBookingId, setDeleteBookingId] = useState('')
    /**
     * Attendance of PT Booking
     * */
    const [attendPTDialog, setAttendPTDialog] = useState(false);
    const [attendPTLoader, setAttendPTLoader] = useState(false)
    const [attendPTId, setAttendPTId] = useState('')
    /**
    * Booking of Gym Classes
    * */
    const [classDialog, setClassDialog] = React.useState(false);
    const [gymClass, setGymClass] = React.useState<ClassDialogView>({} as ClassDialogView);
    const [classMembers, setClassMembers] = React.useState([]);
    const [classMembersLoader, setClassMembersLoader] = useState(false);
    const [paymentLoader, setPaymentLoader] = useState(false);
    /**
     * Reschedule Booking of Gym Classes
     * */
    const [rescheduleLoader, setRescheduleLoader] = useState(false);
    /**
     * Mark Done
     * */
    const [markDoneLoader, setMarkDoneLoader] = useState(false);
    /**
     * Mark Customer Attendance
     * */
    const [attendanceLoader, setAttendanceLoader] = useState(false);

    const defaultOpc = {
        id:'',
        serviceName:'',
        instructorId: '',
        sessionContractId: '',
        memberIds: '',
        sessions: {
            forDate: '',
            openTime: '',
            closeTime: '',
        }
    }
    const [opc, setOpc] = useState(defaultOpc)

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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([])
    }, []);

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setGymId({label: value?.label, value: value?.value})
    }

    /**
    * Triggers when a calendar dateRange is changed via next/prev btn.
    * */
    const handleDateChange = () => {
        if(gymId?.value){
            loadViaCalendarRef()
        }
    }

    /**
    * Cancellation of PT Booking
    * */
    const handleRemovePTBooking = (bookingId:string) => {
        setUnbookDialog(true)
        setDeleteBookingId(bookingId)
    }

    const handleCloseRemovePTBooking = () => {
        setDeleteBookingId('')
        setUnbookDialog(false)
    }

    const removePTBooking = () => {
        setRemovePTBookingLoader(true)
        CancelPTBooking(deleteBookingId).then((response) => {
            if(response.status) {
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Cancelled successfully.')
                loadViaCalendarRef()
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setUnbookDialog(false)
            setRemovePTBookingLoader(false)
            setCreateBookingModal(false)
        }).catch((e) => {
            setUnbookDialog(false)
            setCreateBookingModal(false)
            setRemovePTBookingLoader(false)
        })
    }

    /**
     * Attendance of PT Booking
     * */
    const handleAttendPTBooking = (bookingId:string) => {
        setAttendPTDialog(true)
        setAttendPTId(bookingId)
    }

    const handleCloseAttendPTBooking = () => {
        setAttendPTId('')
        setAttendPTDialog(false)
    }

    const attendPTBooking = () => {
        setAttendPTLoader(true)
        AttendPTSession(attendPTId).then((response) => {
            if(response.status) {
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Attended successfully.')
                loadViaCalendarRef()
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setAttendPTDialog(false)
            setAttendPTLoader(false)
            setCreateBookingModal(false)
        }).catch((e) => {
            setAttendPTDialog(false)
            setCreateBookingModal(false)
            setAttendPTLoader(false)
        })
    }

    /**
    * Booking of Gym Class
    * */
    const handleClassDialogOpen = (params:ClassDialogView) => {
        setGymClass(params)
        setClassMembers([])
        fetchBookedMembers({date:params.date, gymId:gymId.value, scheduleId:params.scheduleId, scheduleGroupId:params.scheduleGroupId, openTime: params.openTime})
        setClassDialog(true);
    };

    const handleClassDialogClose = () => {
        setClassDialog(false);
    };

    const fetchBookedMembers = (params:ClassMemberInput) => {
        return new Promise((resolve) => {
            setClassMembersLoader(true)
            AllBookedPTClassSessions({limit:0},params).then((response) => {
                const { list } = response
                const rows = list.map((e:any) => {
                    return {
                        id: e.customer.id,
                        _isAttended:e.isAttended,
                        isAttended: e.isAttended ? <TaskAltOutlinedIcon color={'success'}/> : <CancelOutlinedIcon color={'error'}/>,
                        isPurchased: e.isPurchased ? <TaskAltOutlinedIcon color={'success'}/> : <CancelOutlinedIcon color={'error'}/>,
                        customerName: <Link underline="none" key={e.customer.id} component={NavLink} to={ROUTES.CUSTOMER.TAB(e.customer.id,'details')}>{e.customer.fullName}</Link>,
                        customerCode: e.customer.customerCode,
                        action: ''
                    }
                })
                setClassMembers(rows)
                setClassMembersLoader(false)
                resolve(rows)
            }).catch((response) => {
                console.log(response)
                setClassMembersLoader(false)
                resolve([])
            })
        })
    }

    /**
    * This method will always deal with updates either for PT or Class
    * */
    const handleEventClick = (info: any) => {
        info.jsEvent.preventDefault();
        if(info.event.extendedProps.bookingType === ORDER_TYPE.PRIVATE_COACH){
            setOpc({
                id: info.event.extendedProps.id,
                serviceName: info.event.title,
                instructorId: info.event.extendedProps.instructor.id,
                sessionContractId: info.event.extendedProps.sessionContractId,
                members: info.event.extendedProps.members,
                memberIds: info.event.extendedProps?.members?.map((e:{id:string}) => e.id),
                customer: info.event.extendedProps.customer,
                attend: info.event.extendedProps.attend,
                isFree: info.event.extendedProps.isFree,
                sessions: {
                    forDate: info.event.extendedProps.sessionDate,
                    openTime: info.event.extendedProps.openTime,
                    closeTime: info.event.extendedProps.closeTime,
                }
            })
            setTitle(hasPermission(PERMISSIONS.SESSION_CONTRACT.BOOK) ? 'Update Contract Booking' : 'View PT Booking')
            setBtnLabel('Update')
            setCreateBookingModal(true)
        } else if(info.event.extendedProps.bookingType === ORDER_TYPE.GYM_CLASS) {
            const {title,status,date,endDate,spotsAllotted,spotsCapacity,openTime,closeTime,instructors,scheduleId,scheduleGroupId} = info.event.extendedProps
            handleClassDialogOpen({title,status,date,endDate,spotsAllotted,spotsCapacity,openTime,closeTime,instructors,scheduleId,scheduleGroupId})
        }
    };

    const handleDateClick = (info: any) => {
        if(!gymId?.value || !hasPermission(PERMISSIONS.SESSION_CONTRACT.BOOK)) return
        setTitle('PT Contract Booking')
        setBtnLabel('Book Now')
        setCreateBookingModal(true)
        const _opc:any = cloneDeep(defaultOpc)
        _opc.sessions.forDate = dayjs(info.date).format("YYYY-MM-DD")
        _opc.sessions.openTime = dayjs(info.date).format('HH:mm:ss')
        setOpc(_opc)
    };

    const handleEventMouseEnter = (info: any) => {
        info.el.style.cursor = 'pointer';
    };

    const handleInstructorChange = (event: any, value: { value: string, label: string } | null) => {
        setInstructorId({label: value?.label, value: value?.value})
    }

    const handleCloseCreateBookingDialog = () => {
        setOpc(defaultOpc)
        setCreateBookingModal(false);
    };

    const loadEvents = async (params:AllPTSessionInput) => {
        setEvents([])
        setLoader(true)
        await Promise.all([loadGymClasses(params),loadPTSessions(params)])
        setLoader(false)
    }

    const loadPTSessions = async (params: AllPTSessionInput) => {
        return new Promise((resolve) => {
            AllBookedPTSessions(params)
                .then((response: any) => {
                    const { list } = response;
                    setEvents((prevEvents) => {
                        const newRows = list
                            .filter((e) => !prevEvents.some((_e) => _e.extendedProps.id === e.id))
                            .map((e: any) => {
                                const date = dayjs(e.sessionDate).format("YYYY-MM-DD");
                                return {
                                    title:
                                        e.attend === PT_SESSION_ATTEND_STATUS.ATTENDED
                                            ? "✔ " + e.serviceName
                                            : e.attend === PT_SESSION_ATTEND_STATUS.MISSED
                                            ? "❌ " + e.serviceName
                                            : e.serviceName,
                                    start: date + "T" + e.openTime,
                                    end: date + "T" + e.closeTime,
                                    backgroundColor: theme.palette.primary.main,
                                    extendedProps: {
                                        id: e.id,
                                        bookingType: ORDER_TYPE.PRIVATE_COACH,
                                        sessionContractId: e.sessionContractId,
                                        openDuration: e.openDuration,
                                        sessionDate: e.sessionDate,
                                        openTime: e.openTime,
                                        closeTime: e.closeTime,
                                        attend: e.attend,
                                        isFree: e.isFree,
                                        members: e.members,
                                        customer: e.customer,
                                        instructor: {
                                            id: e.instructorId,
                                            fullName: e.instructorName,
                                        },
                                    },
                                };
                            });
                        return [...prevEvents, ...newRows];
                    });
                    resolve(true)
                })
                .catch((e) => {
                    console.log(e);
                    resolve(true)
                });
        })
    };

    const bookingOnSubmit = (data, handleCloseBookMemberDialog) => {
        if(!data.bookedTill) delete data.bookedTill
        const _data = {
            ...data,
            scheduleId:gymClass.scheduleId,
            scheduleGroupId:gymClass.scheduleGroupId,
            bookedTime:gymClass.openTime,
            paymentMethod: {
                name: '',
                paymentScheme: data.paymentMethod
            }
        }
        setPaymentLoader(true)
        BuyAGymClass(_data).then(async (response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Booked successfully.')
                handleCloseBookMemberDialog()
                loadViaCalendarRef()
                const bookedMembers = await fetchBookedMembers({date:data.bookedFor, openTime:gymClass.openTime, gymId:gymId.value, scheduleId:gymClass.scheduleId, scheduleGroupId:gymClass.scheduleGroupId})
                setGymClass((prev) => {
                    return {...prev, spotsAllotted: bookedMembers.length}
                })
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            setPaymentLoader(false)
            toastContext.setToast(true)
        }).catch((e) => {
            handleCloseBookMemberDialog()
            console.log(e)
        })
    }

    const rescheduleOnSubmit = (data, handleCloseRescheduleDialog) => {
        for (const key of Object.keys(data)){
            switch (key) {
                case 'spots':
                case 'duration':
                    data[key] = parseInt(data[key])
                    break
            }
        }
        setRescheduleLoader(true)
        ModifyGymClassSchedule(data).then((response) => {
            if(response.success){
                loadViaCalendarRef()
                handleCloseRescheduleDialog()
                handleClassDialogClose()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Rescheduled successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setRescheduleLoader(false)
        }).catch((e) => {
            console.log(e)
            setRescheduleLoader(false)
        })
    }

    const markDone = (data, handleCloseMarkClassDoneDialog) => {
        for (const key of Object.keys(data)){
            switch (key) {
                case 'spots':
                case 'duration':
                    data[key] = parseInt(data[key])
                    break
            }
        }
        setMarkDoneLoader(true)
        ModifyGymClassSchedule(data).then((response) => {
            if(response.success){
                loadViaCalendarRef()
                handleCloseMarkClassDoneDialog()
                handleClassDialogClose()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Marked done successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setMarkDoneLoader(false)
        }).catch((e) => {
            console.log(e)
            setMarkDoneLoader(false)
        })
    }

    const markAttendance = (data, handleCloseAttendanceDialog) => {
        setAttendanceLoader(true)
        AttendBookedGymClass({bookedFor:gymClass.date, bookedTime:gymClass.openTime, scheduleId:gymClass.scheduleId, scheduleGroupId:gymClass.scheduleGroupId, customerIds:data}).then((response) => {
            if(response.success){
                fetchBookedMembers({date:gymClass.date, openTime:gymClass.openTime, scheduleId:gymClass.scheduleId, scheduleGroupId:gymClass.scheduleGroupId, gymId:gymId.value})
                handleCloseAttendanceDialog()
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Attendance marked successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setAttendanceLoader(false)
        }).catch((e) => {
            console.log(e)
            setAttendanceLoader(false)
        })
    }

    const loadGymClasses = async (params: AllPTSessionInput) => {
        const _params = { fromDate: params.startDate, toDate: params.endDate, gymId: params.gymId, instructorIds: params.instructorId ? [params.instructorId] : undefined };
        return new Promise((resolve) => {
            GymClassesListing(_params)
                .then((response: any) => {
                    const { list } = response;
                    setEvents((prevEvents) => {
                        const newRows = list
                            .filter((e) => !prevEvents.some((_e) => _e.extendedProps.id === e.id))
                            .map((e: any) => ({
                                title: e.status === GYM_CLASS_STATUS.DONE ? "✔ " + e.name : e.name,
                                start: e.date + "T" + e.openTime,
                                end: e.date + "T" + e.closeTime,
                                backgroundColor: theme.palette.triadic.main,
                                extendedProps: {
                                    id: e.id,
                                    title: e.name,
                                    bookingType: ORDER_TYPE.GYM_CLASS,
                                    date:e.date,
                                    status:e.status,
                                    endDate:e.endDate,
                                    openTime:e.openTime,
                                    closeTime:e.closeTime,
                                    spotsCapacity: e.spotsCapacity,
                                    spotsAllotted: e.spotsAllotted,
                                    soldOut: e.soldOut,
                                    scheduleId: e.scheduleId,
                                    scheduleGroupId: e.scheduleGroupId,
                                    instructors: e.instructors,
                                },
                            }));
                        return [...prevEvents, ...newRows];
                    });
                    resolve(true)
                })
                .catch((e) => {
                    console.log(e)
                    resolve(true)
                });
        })
    };


    const loadViaCalendarRef = () => {
        const calendarApi = calendarRef.current?.getApi()
        if(calendarApi?.view){
            loadEvents({
                gymId:gymId.value,
                startDate: dayjs(calendarApi.view.currentStart).format("YYYY-MM-DD"),
                endDate: dayjs(calendarApi.view.currentEnd).format("YYYY-MM-DD"),
                instructorId: instructorId?.value || undefined
            })
        }
    }

    const fetchInstructors = (gymId) => {
        setInstructorLoader(true)
        GetInstructors({limit:0},{gymId}).then(({list}:any) => {
            setInstructors(list.map((e:any) => {
                return { value: e.id, label: e.fullName }
            }))
            setInstructorLoader(false)
        }).catch((e) => {
            setInstructorLoader(false)
            console.log(e.message)
        })
    }

    const saveContractBooking = (data) => {
        delete data.members
        delete data.attend
        delete data.customer
        delete data.serviceName
        delete data.isFree
        if(data?.id){
            updateContractBooking(data)
        }else{
            createContractBooking(data)
        }
    }

    const createContractBooking = (data) => {
        setBookingLoader(true)
        BookAPrivateCoach(data).then((response) => {
            if(response?.orderPrivateCoach?.id){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Reserved successfully.')
                loadViaCalendarRef()
                setCreateBookingModal(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setBookingLoader(false)
        }).catch((e) => {
            console.log(e)
            setBookingLoader(false)
        })
    }

    const updateContractBooking = (data) => {
        setBookingLoader(true)
        data = { ...data, ...data.sessions }
        delete data.sessions
        UpdateABooking(data).then((response) => {
            if(response?.orderPrivateCoach?.id){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
                loadViaCalendarRef()
                setCreateBookingModal(false)
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setBookingLoader(false)
        }).catch((e) => {
            console.log(e)
            setBookingLoader(false)
        })
    }

    useEffect(() => {
        if(gymId?.value){
            if(calendarRef.current){
                if(gymSelection){
                    loadViaCalendarRef()
                }
                fetchInstructors(gymId.value)
            }
        }else {
            setEvents([])
        }
    }, [gymId,calendarRef.current]);

    useEffect(() => {
        if(!gymId?.value) return
        if(calendarRef.current){
            loadViaCalendarRef()
        }
    }, [instructorId,calendarRef.current]);

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
    }, [])

    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;
        const targetView = isMobile ? 'timeGridDay' : 'timeGridWeek';
        if (calendarApi.view.type !== targetView) {
            // On mobile, land on today; on desktop, keep the currently focused date.
            calendarApi.changeView(targetView, isMobile ? dayjs().toDate() : calendarApi.getDate());
        }
    }, [isMobile]);

    return (
        <Box sx={{ mt: { xs: 0, sm: 1 } }}>
            <Fragment>
                <Dialog
                    open={createBookingModal}
                    aria-hidden={!createBookingModal}
                    aria-labelledby="draggable-dialog-title"
                    onClose={handleCloseCreateBookingDialog}
                    PaperComponent={PaperComponent}
                    fullWidth
                    maxWidth="sm"
                    sx={{
                        '& .MuiDialog-paper': {
                            m: { xs: 1.5, sm: 2 },
                            width: { xs: 'calc(100% - 24px)', sm: undefined },
                        },
                    }}
                >
                    <DialogTitle sx={{ px: { xs: 2, sm: 3 }, cursor: 'move' }} id="draggable-dialog-title">
                        {title}
                    </DialogTitle>
                    <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                        <Box sx={{ width: '100%' }}>
                            <ProgressBar formLoader={bookingLoader}/>
                            <ContractBooking defaultValues={opc} loading={bookingLoader} gymId={gymId?.value} btnLabel={btnLabel} callback={saveContractBooking} instructors={instructors} unbookCallback={handleRemovePTBooking} attendCallback={handleAttendPTBooking}/>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Fragment>
            <AppDialog open={unbookDialog} handleDialogClose={handleCloseRemovePTBooking} title={'Confirm Cancellation'} body={'Are you sure you want to cancel this booking?'} dialogBtnLoading={removePTBookingLoader} dialogBtnLabel={'Confirm'} onSubmit={removePTBooking}/>
            <AppDialog open={attendPTDialog} handleDialogClose={handleCloseAttendPTBooking} title={'Confirm Attendance'} body={'Are you sure to mark this session attended?'} dialogBtnLoading={attendPTLoader} dialogBtnLabel={'Confirm'} onSubmit={attendPTBooking}/>
            <ClassBooking classDialog={classDialog} gymId={gymId?.value} gymClass={gymClass} classMembers={classMembers} loading={classMembersLoader} handleClassDialogClose={handleClassDialogClose} paymentLoader={paymentLoader} bookingOnSubmit={bookingOnSubmit} rescheduleOnSubmit={rescheduleOnSubmit} markDone={markDone} markAttendance={markAttendance} instructors={instructors} rescheduleLoader={rescheduleLoader} markDoneLoader={markDoneLoader} attendanceLoader={attendanceLoader}/>
            <Grid container spacing={2} sx={{ mb: 2, mt: { xs: 0, sm: 1 } }}>
                {
                    gymSelection ?
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                id="gyms-dd"
                                options={gyms}
                                getOptionLabel={(option) => option.label || ''}
                                value={gymId}
                                loading={gymLoader}
                                onChange={handleGymChange}
                                renderInput={(params) => <FormInput fullWidth={true} disabled={!gyms.length} label={'Gym'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {gymLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                    :<></>
                }
                {
                    !hasRole(ROLE.PT_ADMIN) ?
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                id="instructors-dd"
                                options={instructors}
                                getOptionLabel={(option) => option.label || ''}
                                value={instructorId}
                                loading={instructorLoader}
                                onChange={handleInstructorChange}
                                renderInput={(params) => <FormInput fullWidth={true} disabled={!instructors.length} label={'Instructor'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {instructorLoader ? <CircularProgress color="primary" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                    :<></>
                }
            </Grid>
            <Box
                sx={{
                    position: 'relative',
                    overflowX: 'auto',
                    '& .fc': {
                        fontSize: { xs: '0.8125rem', md: '1rem' },
                    },
                    '& .fc .fc-toolbar': {
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        alignItems: { xs: 'stretch', sm: 'center' },
                    },
                    '& .fc .fc-toolbar-title': {
                        fontSize: { xs: '1.1rem', md: '1.5rem' },
                        textAlign: { xs: 'center', sm: 'left' },
                    },
                    '& .fc .fc-toolbar-chunk': {
                        display: 'flex',
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                    },
                    '& .fc .fc-button': {
                        padding: { xs: '4px 8px', md: '6px 12px' },
                    },
                    '& .fc .fc-timegrid-event .fc-event-title': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                }}
            >
                {
                    loader ?
                        <Box sx={{position: 'absolute', textAlign: 'center', top: 0, bottom: 0, width: '100%', zIndex: 3, paddingTop: '120px'}}>
                            <CircularProgress color="primary" />
                        </Box>
                    :<></>
                }
                <FullCalendar
                    plugins={[ timeGridPlugin, interactionPlugin ]}
                    ref={calendarRef}
                    initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                    headerToolbar={
                        isMobile
                            ? { left: 'prev,next', center: 'title', right: 'today' }
                            : { left: 'prev,next today', center: 'title', right: 'timeGridDay,timeGridWeek' }
                    }
                    buttonText={{
                        today: 'Today',
                        day: 'Day',
                        week: 'Week',
                    }}
                    events={events}
                    height={isMobile ? 'auto' : 1350}
                    contentHeight={isMobile ? 650 : undefined}
                    stickyHeaderDates={isMobile}
                    dayMaxEventRows={true}
                    nowIndicator
                    datesSet={handleDateChange}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventMouseEnter={handleEventMouseEnter}
                />
            </Box>
        </Box>
    )
}

export default Calendar