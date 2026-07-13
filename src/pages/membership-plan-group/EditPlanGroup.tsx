import {useContext, useEffect, useState} from 'react'
import PlanGroupForm from "./PlanGroupForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetMembershipPlanGroup,SaveMembershipPlanGroup} from "../../services/membership.plan.group.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";

function EditPlanGroup() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.MEMBERSHIP_PLAN_GROUP.LIST, name: 'Plan Groups' }, {name: 'Edit Plan Group' }])
        GetMembershipPlanGroup(id).then((planGroup) => {
            setRecord(planGroup)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveMembershipPlanGroup(data).then((response) => {
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
            <PageTitle title={'Edit Plan Group'} backTo={ROUTES.MEMBERSHIP_PLAN_GROUP.LIST}/>
            <PlanGroupForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditPlanGroup
