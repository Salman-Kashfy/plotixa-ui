import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreatePlot as _CreatePlot } from '../../services/plot.service';
import PageTitle from '../../components/PageTitle';
import PlotForm from './PlotForm';

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
                toastContext.setToastMessage('Plot created successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.PLOT.LIST);
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
            { to: ROUTES.PLOT.LIST, name: 'Plots' },
            { name: 'Add Plot' },
        ]);
    }, []);

    return (
        <>
            <PageTitle title="Add Plot" backTo={ROUTES.PLOT.LIST} />
            <PlotForm callback={onSubmit} btnLabel="Create" loading={loading} create />
        </>
    );
}

export default CreatePlot;
