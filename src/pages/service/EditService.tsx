import {useContext, useEffect, useState} from 'react'
import ServiceForm from "./ServiceForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetService,SaveService} from "../../services/service.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";

function EditService() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.SERVICE.LIST, name: 'Services' }, {name: 'Edit Service' }])
        GetService(id).then((service) => {
            setRecord(service)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveService(data).then((response) => {
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
            <PageTitle title={'Edit Service'} backTo={ROUTES.SERVICE.LIST}/>
            <ServiceForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditService
