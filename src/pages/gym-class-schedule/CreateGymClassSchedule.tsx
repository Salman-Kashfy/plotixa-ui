import {useEffect, useState, useContext} from 'react'
import GymClassScheduleForm from "./GymClassScheduleForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ToastContext} from '../../hooks/ToastContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveGymClassGroupSchedule} from "../../services/class.schedule.service";
import {useNavigate} from "react-router";

function CreateGymClassSchedule() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS_SCHEDULE.LIST, name: 'Class Schedules' }, {name: 'Create Class Schedule' }])
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveGymClassGroupSchedule(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.CLASS_SCHEDULE.EDIT(response.data.id))
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
            <PageTitle title={'Create Class Schedule'} backTo={ROUTES.CLASS_SCHEDULE.LIST}/>
            <GymClassScheduleForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
    )
}

export default CreateGymClassSchedule
