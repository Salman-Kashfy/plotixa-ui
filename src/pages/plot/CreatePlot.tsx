import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreatePlot as _CreatePlot } from '../../services/plot.service';
import PageTitle from '../../components/PageTitle';
import CreatePlotForm from './CreatePlotForm';

const toErrorText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(toErrorText).filter(Boolean).join(', ');
    if (value && typeof value === 'object') {
        if (typeof value.message === 'string') return value.message;
        if (typeof value.msg === 'string') return value.msg;
        return JSON.stringify(value);
    }
    return '';
};

const getErrorMessage = (response: any) => {
    const errors = response?.errors;
    const details = Array.isArray(errors)
        ? errors.map(toErrorText).filter(Boolean).join(', ')
        : typeof errors === 'string'
            ? errors
            : errors && typeof errors === 'object'
                ? Object.entries(errors).flatMap(([field, messages]) =>
                    [`${field}: ${toErrorText(messages)}`]
                ).join(', ')
                : '';

    return toErrorText(response?.message) ||
        toErrorText(response?.errorMessage) ||
        toErrorText(response?.error) ||
        details ||
        'Unable to create plots.';
};

function CreatePlot() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        setLoading(true);
        _CreatePlot(data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                const count = Array.isArray(response.data) ? response.data.length : 1;
                toastContext.setToastMessage(`${count} plot${count === 1 ? '' : 's'} created successfully.`);
                toastContext.setToast(true);
                navigate(ROUTES.PLOT.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(getErrorMessage(response));
                toastContext.setToast(true);
            }
            setLoading(false);
        }).catch((error) => {
            toastContext.setToastSeverity('error');
            setLoading(false);
            toastContext.setToastMessage(getErrorMessage(error?.response?.data || error));
            toastContext.setToast(true);
        });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.PLOT.LIST, name: 'Plots' },
            { name: 'Add Plot' },
        ]);
    }, []);

    return (
        <>
            <PageTitle title="Add Plot" backTo={ROUTES.PLOT.LIST} />
            <CreatePlotForm callback={onSubmit} btnLabel="Create" loading={loading} />
        </>
    );
}

export default CreatePlot;
