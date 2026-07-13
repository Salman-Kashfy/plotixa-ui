import {useEffect, useState, useContext} from 'react'
import BrandForm from "./BrandForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import { CreateBrand as _CreateBrand } from "../../services/brand.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function CreateBrand() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        setLoading(true)
        _CreateBrand(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.BRAND.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.BRAND.LIST, name: 'Brands' }, {name: 'Create Brand' }])
    }, []);

    return (
        <>
            <PageTitle title={'Create Brand'} backTo={ROUTES.BRAND.LIST}/>
            <BrandForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
    )
}

export default CreateBrand
