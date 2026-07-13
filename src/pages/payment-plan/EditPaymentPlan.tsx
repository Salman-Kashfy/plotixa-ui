import {useContext, useEffect, useState} from 'react'
import PaymentPlanForm from "./PaymentPlanForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetPaymentPlan,SavePaymentPlan} from "../../services/payment.plan.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";

function EditPaymentPlan() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.PAYMENT_PLAN.LIST, name: 'Payment Plan' }, {name: 'Edit Payment Plan' }])
        GetPaymentPlan(id).then((paymentPlan) => {
            setRecord(paymentPlan)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SavePaymentPlan(data).then((response) => {
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
            <PageTitle title={'Edit Payment Plan'} backTo={ROUTES.PAYMENT_PLAN.LIST}/>
            <PaymentPlanForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditPaymentPlan
