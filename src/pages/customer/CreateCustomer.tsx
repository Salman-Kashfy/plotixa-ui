import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert } from '@mui/material';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES } from '../../utils/constants';
import { UpsertCustomer, type CustomerFields, type CustomerUpsertPayload } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import CustomerForm from './CustomerForm';

function CreateCustomer() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const navigate = useNavigate();
    const projectUuid: string = adminContext.projectUuid || '';
    const projectQuery = projectUuid ? `?projectUuid=${encodeURIComponent(projectUuid)}` : '';
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: CustomerFields) => {
        if (!projectUuid) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Select a project before saving a customer.');
            toastContext.setToast(true);
            return;
        }
        setLoading(true);
        const payload: CustomerUpsertPayload = { ...data, projectUuid };
        UpsertCustomer(payload).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer created successfully.');
                toastContext.setToast(true);
                navigate(`${ROUTES.CUSTOMER.LIST}${projectQuery}`);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(response.errorMessage || response.message || 'Something went wrong.');
                toastContext.setToast(true);
            }
            setLoading(false);
        }).catch(() => {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Unable to save customer. Please try again.');
            toastContext.setToast(true);
            setLoading(false);
        });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: `${ROUTES.CUSTOMER.LIST}${projectQuery}`, name: 'Customers' },
            { name: 'Add Customer' },
        ]);
    }, [projectQuery]);

    return (
        <>
            <PageTitle title="Add Customer" backTo={`${ROUTES.CUSTOMER.LIST}${projectQuery}`} />
            {!projectUuid && <Alert severity="error" sx={{ mb: 2 }}>Select a project before adding a customer.</Alert>}
            <CustomerForm callback={onSubmit} btnLabel="Create" loading={loading} />
        </>
    );
}

export default CreateCustomer;
