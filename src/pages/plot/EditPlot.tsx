import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert } from '@mui/material';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { PLOT_STATUS, ROUTES } from '../../utils/constants';
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
    const [loadError, setLoadError] = useState('');

    const onSubmit = (data: any) => {
        if ((plotData as any).status !== PLOT_STATUS.ACTIVE) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Only active plots can be updated.');
            toastContext.setToast(true);
            return;
        }
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
            if (data.status !== PLOT_STATUS.ACTIVE) {
                setLoadError('Only active plots can be updated.');
                setFormLoader(false);
                return;
            }
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
            {loadError ? (
                <Alert severity="warning">{loadError}</Alert>
            ) : (
                <PlotForm
                    data={plotData}
                    callback={onSubmit}
                    btnLabel="Update"
                    loading={loading}
                    formLoader={formLoader}
                />
            )}
        </>
    );
}

export default EditPlot;
