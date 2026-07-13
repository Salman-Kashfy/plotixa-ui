import {useEffect, useState, useContext} from 'react'
import PaymentPlanForm from "../payment-plan/PaymentPlanForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import { SavePaymentPlan } from "../../services/payment.plan.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreatePaymentPlan() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SavePaymentPlan(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.PAYMENT_PLAN.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.PAYMENT_PLAN.LIST, name: 'Payment Plans' }, {name: 'Create Payment Plan' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Payment Plan'} backTo={ROUTES.PAYMENT_PLAN.LIST}/>
            <PaymentPlanForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
)
}

export default CreatePaymentPlan
