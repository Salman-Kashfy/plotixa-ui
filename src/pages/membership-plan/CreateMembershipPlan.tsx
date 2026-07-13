import {useEffect, useState, useContext} from 'react'
import MembershipPlanForm from "./MembershipPlanForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveMembershipPlan} from "../../services/membership.plan.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateMembershipPlan() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SaveMembershipPlan(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.MEMBERSHIP_PLAN.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.MEMBERSHIP_PLAN.LIST, name: 'Membership Plans' }, {name: 'Create Membership Plan' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Membership Plan'} backTo={ROUTES.MEMBERSHIP_PLAN.LIST}/>
            <MembershipPlanForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
)
}

export default CreateMembershipPlan
