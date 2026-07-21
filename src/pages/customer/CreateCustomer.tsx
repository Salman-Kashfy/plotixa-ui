import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreateCustomer as _CreateCustomer } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import CustomerForm from './CustomerForm';

function CreateCustomer() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        setLoading(true);
        _CreateCustomer(data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer created successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.CUSTOMER.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(response.errorMessage || 'Something went wrong.');
                toastContext.setToast(true);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.CUSTOMER.LIST, name: 'Customers' },
            { name: 'Add Customer' },
        ]);
    }, []);

    return (
        <>
            <PageTitle title="Add Customer" backTo={ROUTES.CUSTOMER.LIST} />
            <CustomerForm callback={onSubmit} btnLabel="Create" loading={loading} />
        </>
    );
}

export default CreateCustomer;
