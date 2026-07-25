import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreateBooking } from '../../services/booking.service';
import PageTitle from '../../components/PageTitle';
import BookingForm from './BookingForm';

function CreateBookingPage() {
    const navigate = useNavigate();
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Bookings', path: ROUTES.BOOKING.LIST },
            { name: 'Create' },
        ]);
    }, []);

    const handleSubmit = (data: any) => {
        setLoading(true);
        CreateBooking(data).then((res) => {
            setLoading(false);
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(res.message || 'Booking created successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.BOOKING.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(res.message || 'Something went wrong.');
                toastContext.setToast(true);
            }
        }).catch(() => setLoading(false));
    };

    return (
        <>
            <PageTitle title="Create Booking" />
            <BookingForm callback={handleSubmit} btnLabel="Create Booking" loading={loading} />
        </>
    );
}

export default CreateBookingPage;
