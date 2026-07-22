import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { GetToken, UpdateToken } from '../../services/token.service';
import PageTitle from '../../components/PageTitle';
import TokenForm from './TokenForm';

function EditTokenPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [tokenData, setTokenData] = useState<any>({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Tokens', path: ROUTES.TOKEN.LIST },
            { name: 'Edit' },
        ]);
        GetToken(id!).then((data) => {
            setTokenData(data);
            setFormLoader(false);
        }).catch(() => setFormLoader(false));
    }, [id]);

    const handleSubmit = (data: any) => {
        setLoading(true);
        UpdateToken(id!, data).then((res) => {
            setLoading(false);
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(res.message || 'Token updated successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.TOKEN.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(res.message || 'Something went wrong.');
                toastContext.setToast(true);
            }
        }).catch(() => setLoading(false));
    };

    return (
        <>
            <PageTitle title="Edit Token" />
            <TokenForm
                data={tokenData}
                callback={handleSubmit}
                btnLabel="Update Token"
                loading={loading}
                formLoader={formLoader}
            />
        </>
    );
}

export default EditTokenPage;
