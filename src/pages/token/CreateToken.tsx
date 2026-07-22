import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreateToken } from '../../services/token.service';
import PageTitle from '../../components/PageTitle';
import TokenForm from './TokenForm';
import { useEffect } from 'react';

function CreateTokenPage() {
    const navigate = useNavigate();
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Tokens', path: ROUTES.TOKEN.LIST },
            { name: 'Create' },
        ]);
    }, []);

    const handleSubmit = (data: any) => {
        setLoading(true);
        CreateToken(data).then((res) => {
            setLoading(false);
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(res.message || 'Token created successfully.');
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
            <PageTitle title="Create Token" />
            <TokenForm callback={handleSubmit} btnLabel="Create Token" loading={loading} />
        </>
    );
}

export default CreateTokenPage;
