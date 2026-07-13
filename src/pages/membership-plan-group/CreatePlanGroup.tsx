import {useEffect, useState, useContext} from 'react'
import PlanGroupForm from "./PlanGroupForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveMembershipPlanGroup} from "../../services/membership.plan.group.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreatePlanGroup() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SaveMembershipPlanGroup(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.MEMBERSHIP_PLAN_GROUP.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.MEMBERSHIP_PLAN_GROUP.LIST, name: 'Plan Groups' }, {name: 'Create Plan Group' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Plan Group'} backTo={ROUTES.MEMBERSHIP_PLAN_GROUP.LIST}/>
            <PlanGroupForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
    )
}

export default CreatePlanGroup
