import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { CreateExpense as _CreateExpense } from '../../services/expense.service';
import PageTitle from '../../components/PageTitle';
import ExpenseForm from './ExpenseForm';

function CreateExpense() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        setLoading(true);
        _CreateExpense(data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Expense created successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.EXPENSE.LIST);
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
            { to: ROUTES.EXPENSE.LIST, name: 'Expenses' },
            { name: 'Add Expense' },
        ]);
    }, []);

    return (
        <>
            <PageTitle title="Add Expense" backTo={ROUTES.EXPENSE.LIST} />
            <ExpenseForm callback={onSubmit} btnLabel="Create" loading={loading} create />
        </>
    );
}

export default CreateExpense;
