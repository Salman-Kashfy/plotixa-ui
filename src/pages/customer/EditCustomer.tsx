import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { GetCustomer, UpdateCustomer } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import CustomerForm from './CustomerForm';

function EditCustomer() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [customerData, setCustomerData] = useState({});

    const onSubmit = (data: any) => {
        setLoading(true);
        UpdateCustomer(id!, data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer updated successfully.');
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
            { name: 'Edit Customer' },
        ]);
        GetCustomer(id!).then((data) => {
            setCustomerData(data);
            setFormLoader(false);
        }).catch(() => setFormLoader(false));
    }, []);

    return (
        <>
            <PageTitle title="Edit Customer" backTo={ROUTES.CUSTOMER.LIST} />
            <CustomerForm
                data={customerData}
                callback={onSubmit}
                btnLabel="Update"
                loading={loading}
                formLoader={formLoader}
            />
        </>
    );
}

export default EditCustomer;
