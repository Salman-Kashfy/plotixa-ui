import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { GetBooking, UpdateBooking } from '../../services/booking.service';
import PageTitle from '../../components/PageTitle';
import BookingForm from './BookingForm';

function EditBookingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [bookingData, setBookingData] = useState<any>({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { name: 'Bookings', path: ROUTES.BOOKING.LIST },
            { name: 'Edit' },
        ]);
        GetBooking(id!).then((data) => {
            setBookingData(data);
            setFormLoader(false);
        }).catch(() => setFormLoader(false));
    }, [id]);

    const handleSubmit = (data: any) => {
        setLoading(true);
        UpdateBooking(id!, data).then((res) => {
            setLoading(false);
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage(res.message || 'Booking updated successfully.');
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
            <PageTitle title="Edit Booking" />
            <BookingForm
                data={bookingData}
                callback={handleSubmit}
                btnLabel="Update Booking"
                loading={loading}
                formLoader={formLoader}
            />
        </>
    );
}

export default EditBookingPage;
