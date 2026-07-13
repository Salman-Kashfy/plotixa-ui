import {useContext, useEffect, useState} from 'react'
import GymClassForm from "./GymClassForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetGymClass,SaveGymClasses} from "../../services/class.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";

function EditGymClass() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS.LIST, name: 'Classes' }, {name: 'Edit Class' }])
        GetGymClass(id).then((service) => {
            setRecord(service)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveGymClasses(data).then((response) => {
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
            <PageTitle title={'Edit Class'} backTo={ROUTES.CLASS.LIST}/>
            <GymClassForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditGymClass
