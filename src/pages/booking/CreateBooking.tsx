import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES } from '../../utils/constants';
import { GetToken } from '../../services/token.service';
import PageTitle from '../../components/PageTitle';
import BookingForm from './BookingForm';

function CreateBookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const tokenUuid = searchParams.get('tokenUuid');
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(Boolean(tokenUuid));
    const [tokenData, setTokenData] = useState<any>({});
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Bookings', path: ROUTES.BOOKING.LIST },
            { name: 'Create' },
        ]);
    }, []);

    useEffect(() => {
        if (!tokenUuid) return;
        if (!adminContext.projectUuid) {
            setLoadError('Select a project before creating a booking from a token.');
            setFormLoader(false);
            return;
        }

        setFormLoader(true);
        setLoadError('');
        GetToken(tokenUuid, adminContext.projectUuid)
            .then((token) => {
                if (!token?.uuid && !token?.id) {
                    setLoadError('Unable to load the selected token.');
                    return;
                }
                if (token.status !== 'ACTIVE') {
                    setLoadError('Only active tokens can be converted into a booking.');
                    return;
                }
                if (!token.plot || !token.customer) {
                    setLoadError('The token is missing required plot or customer information.');
                    return;
                }
                setTokenData({
                    ...token,
                    tokenAmount: token.amount,
                    tokenUuid: token.uuid || token.id,
                });
            })
            .catch(() => setLoadError('Unable to load the selected token.'))
            .finally(() => setFormLoader(false));
    }, [adminContext.projectUuid, tokenUuid]);

    const handleSubmit = (data: any) => {
        if (!data?.data.uuid) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('A token is required to create a booking.');
            toastContext.setToast(true);
            return;
        }
        setLoading(false);
        toastContext.setToastSeverity('success');
        toastContext.setToastMessage('Booking created successfully.');
        toastContext.setToast(true);
        navigate(ROUTES.BOOKING.LIST);
    };

    return (
        <>
            <PageTitle title="Create Booking" />
            <BookingForm
                data={tokenData}
                tokenLocked={Boolean(tokenUuid)}
                callback={handleSubmit}
                btnLabel="Create Booking"
                loading={loading}
                formLoader={formLoader}
                loadError={loadError}
            />
        </>
    );
}

export default CreateBookingPage;
