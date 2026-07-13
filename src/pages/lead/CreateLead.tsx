import {useEffect, useState, useContext} from 'react'
import LeadForm from "./LeadForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";
import {CreateLead as _CreateLead} from "../../services/lead.service";

function CreateLead() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.LEAD.LIST, name: 'Leads' }, {name: 'Create Lead' }])
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        _CreateLead(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.LEAD.EDIT(response.data.id))
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
            <PageTitle title={'Create Lead'} backTo={ROUTES.LEAD.LIST}/>
            <LeadForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
    )
}

export default CreateLead
