import {useEffect, useState, useContext} from 'react'
import ServiceForm from "../service/ServiceForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
//import { CreateBrand as _CreateBrand } from "../../services/service.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateService() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        // _CreateBrand(data).then((response) => {
        //     if(response.status){
        //         toastContext.setToastSeverity('success')
        //         toastContext.setToastMessage('Created successfully.')
        //         window.scrollTo({ top: 0, behavior: 'smooth' });
        //         navigate(ROUTES.SERVICE.EDIT(response.data.id))
        //     }else{
        //         toastContext.setToastSeverity('error')
        //         toastContext.setToastMessage(response.errorMessage)
        //     }
        //     toastContext.setToast(true)
        //     setLoading(false)
        // })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.SERVICE.LIST, name: 'Services' }, {name: 'Create Service' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Service'} backTo={ROUTES.SERVICE.LIST}/>
            <ServiceForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
)
}

export default CreateService
