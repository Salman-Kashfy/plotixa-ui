import {useEffect, useState, useContext} from 'react'
import AdminForm from "./AdminForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveAdmin} from "../../services/admin.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateAdmin() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SaveAdmin(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.ADMIN.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.ADMIN.LIST, name: 'Admins' }, {name: 'Create Admin' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Admin'} backTo={ROUTES.ADMIN.LIST}/>
            <AdminForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
    )
}

export default CreateAdmin
