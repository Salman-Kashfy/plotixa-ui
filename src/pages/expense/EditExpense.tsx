import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES } from '../../utils/constants';
import { GetExpense, UpdateExpense } from '../../services/expense.service';
import PageTitle from '../../components/PageTitle';
import ExpenseForm from './ExpenseForm';

function EditExpense() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [expenseData, setExpenseData] = useState({});

    const onSubmit = (data: any) => {
        setLoading(true);
        UpdateExpense(id!, data).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Expense updated successfully.');
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
            { name: 'Edit Expense' },
        ]);
        GetExpense(id!).then((data) => {
            setExpenseData(data);
            setFormLoader(false);
        }).catch(() => setFormLoader(false));
    }, []);

    return (
        <>
            <PageTitle title="Edit Expense" backTo={ROUTES.EXPENSE.LIST} />
            <ExpenseForm
                data={expenseData}
                callback={onSubmit}
                btnLabel="Update"
                loading={loading}
                formLoader={formLoader}
            />
        </>
    );
}

export default EditExpense;
