import {useEffect, useState, useContext} from 'react'
import GymForm from "./GymForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {CreateGym as _CreateGym} from "../../services/gym.service";
import {useNavigate} from "react-router";
import {ToastContext} from "../../hooks/ToastContext";

function CreateGym() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        _CreateGym(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.GYM.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.GYM.LIST, name: 'Gyms' }, {name: 'Create Gym' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Gym'} backTo={ROUTES.GYM.LIST}/>
            <GymForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
    )
}

export default CreateGym
