import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES } from '../../utils/constants';
import { GetPlot, UpdatePlot } from '../../services/plot.service';
import PageTitle from '../../components/PageTitle';
import PlotForm from './PlotForm';

function EditPlot() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [plotData, setPlotData] = useState({});

    const onSubmit = (data: any) => {
        setLoading(true);
        UpdatePlot(id!, data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Plot updated successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.PLOT.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(response.message || response.errorMessage || 'Unable to update plot.');
                toastContext.setToast(true);
            }
            setLoading(false);
        }).catch((error) => {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(
                error?.response?.data?.message || error?.message || 'Unable to update plot.',
            );
            toastContext.setToast(true);
            setLoading(false);
        });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.PLOT.LIST, name: 'Plots' },
            { name: 'Edit Plot' },
        ]);
        if (!id || !adminContext.projectUuid) return;
        GetPlot(id, adminContext.projectUuid).then((data) => {
            setPlotData(data);
            setFormLoader(false);
        }).catch((error) => {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error?.response?.data?.message || 'Unable to load plot.');
            toastContext.setToast(true);
            setFormLoader(false);
        });
    }, [id, adminContext.projectUuid]);

    return (
        <>
            <PageTitle title="Edit Plot" backTo={ROUTES.PLOT.LIST} />
            <PlotForm
                data={plotData}
                callback={onSubmit}
                btnLabel="Update"
                loading={loading}
                formLoader={formLoader}
            />
        </>
    );
}

export default EditPlot;
