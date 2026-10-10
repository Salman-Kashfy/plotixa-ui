import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert } from '@mui/material';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES } from '../../utils/constants';
import { GetCustomer, UpsertCustomer, type Customer, type CustomerFields, type CustomerUpsertPayload } from '../../services/customer.service';
import PageTitle from '../../components/PageTitle';
import CustomerForm from './CustomerForm';

function EditCustomer() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const navigate = useNavigate();
    const { uuid } = useParams<{ uuid: string }>();
    const projectUuid: string = adminContext.projectUuid || '';
    const projectQuery = projectUuid ? `?projectUuid=${encodeURIComponent(projectUuid)}` : '';
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [customerData, setCustomerData] = useState<Partial<Customer>>({});
    const [loadError, setLoadError] = useState('');

    const onSubmit = (data: CustomerFields) => {
        if (!projectUuid || !uuid) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('A selected project and customer UUID are required to save this customer.');
            toastContext.setToast(true);
            return;
        }
        setLoading(true);
        const payload: CustomerUpsertPayload = { ...data, uuid, projectUuid };
        UpsertCustomer(payload).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Customer saved successfully.');
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
            { name: 'Customer Details' },
        ]);
        if (!uuid) {
            setLoadError('A customer UUID is required to load customer details.');
            setFormLoader(false);
            return;
        }
        if (!projectUuid) {
            setLoadError('Select a project to view its customers.');
            setFormLoader(false);
            return;
        }
        setFormLoader(true);
        setLoadError('');
        GetCustomer(uuid, projectUuid).then((response) => {
            if (!response.status || !response.data) {
                setLoadError(response.errorMessage || response.message || 'Customer not found or unable to load customer details.');
                setFormLoader(false);
                return;
            }
            setCustomerData(response.data);
            setFormLoader(false);
        }).catch(() => {
            setLoadError('Unable to load customer details. Please try again.');
            setFormLoader(false);
        });
    }, [uuid, projectUuid, projectQuery]);

    return (
        <>
            <PageTitle title="Customer Details" backTo={`${ROUTES.CUSTOMER.LIST}${projectQuery}`} />
            {loadError ? (
                <Alert severity="error">{loadError}</Alert>
            ) : (
                <CustomerForm
                    data={customerData}
                    callback={onSubmit}
                    btnLabel="Save"
                    loading={loading}
                    formLoader={formLoader}
                />
            )}
        </>
    );
}

export default EditCustomer;
