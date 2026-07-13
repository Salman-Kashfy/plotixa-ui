import {useEffect, useState, useContext} from 'react'
import GymClassScheduleForm from "./GymClassScheduleForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ToastContext} from '../../hooks/ToastContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetGymClassSchedule, SaveGymClassGroupSchedule} from "../../services/class.schedule.service";
import {useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";

function EditGymClassSchedule() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS_SCHEDULE.LIST, name: 'Class Schedules' }, {name: 'Update Class Schedule' }])
        GetGymClassSchedule(id).then((row) => {
            setRecord(row)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveGymClassGroupSchedule(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    return (
        <>
            <PageTitle title={'Update Class Schedule'} backTo={ROUTES.CLASS_SCHEDULE.LIST}/>
            {
                record?.orderCount ?
                    <Alert severity="info" sx={{mb:1}}>Schedule groups cannot be modified after receiving bookings.</Alert>
                    :<></>
            }
            <GymClassScheduleForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditGymClassSchedule
