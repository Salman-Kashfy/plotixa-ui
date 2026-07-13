import {useEffect, useState, useContext} from 'react'
import GymClassForm from "../gymClass/GymClassForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveGymClasses} from "../../services/class.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateGymClass() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SaveGymClasses(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.CLASS.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS.LIST, name: 'Classes' }, {name: 'Create Class' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Class'} backTo={ROUTES.CLASS.LIST}/>
            <GymClassForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
)
}

export default CreateGymClass
