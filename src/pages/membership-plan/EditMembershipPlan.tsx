import {useContext, useEffect, useState} from 'react'
import MembershipPlanForm from "./MembershipPlanForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetMembershipPlan,SaveMembershipPlan} from "../../services/membership.plan.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";

function EditMembershipPlan() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.MEMBERSHIP_PLAN.LIST, name: 'Membership Plans' }, {name: 'Edit Membership Plan' }])
        GetMembershipPlan(id).then((record) => {
            setRecord(record)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveMembershipPlan(data).then((response) => {
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
            <PageTitle title={'Edit Membership Plan'} backTo={ROUTES.MEMBERSHIP_PLAN.LIST}/>
            <MembershipPlanForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditMembershipPlan
