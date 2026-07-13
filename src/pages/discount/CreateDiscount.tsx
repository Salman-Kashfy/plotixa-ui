import {useEffect, useState, useContext} from 'react'
import DiscountForm from "./DiscountForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveDiscount} from "../../services/discount.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateDiscount() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        SaveDiscount(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.DISCOUNT.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.DISCOUNT.LIST, name: 'Discounts' }, {name: 'Create Discount' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Discount'} backTo={ROUTES.DISCOUNT.LIST}/>
            <DiscountForm callback={onSubmit} btnLabel={'Create'} loading={loading}/>
        </>
)
}

export default CreateDiscount
