import {useEffect, useState, useContext} from 'react'
import AdminForm from "./AdminForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ToastContext} from '../../hooks/ToastContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetAdmin,SaveAdmin} from "../../services/admin.service";
import {useParams} from "react-router-dom";

function EditAdmin() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.ADMIN.LIST, name: 'Admins' }, {name: 'Update Admin' }])
        GetAdmin(id).then((admin) => {
            setRecord(admin)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveAdmin(data).then((response) => {
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
            <PageTitle title={'Update Admin'} backTo={ROUTES.ADMIN.LIST}/>
            <AdminForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditAdmin
