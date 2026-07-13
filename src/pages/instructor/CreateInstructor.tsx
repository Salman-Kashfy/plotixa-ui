import {useEffect, useState, useContext} from 'react'
import InstructorForm from "./InstructorForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ToastContext} from '../../hooks/ToastContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveInstructors} from "../../services/instructor.service";
import {useNavigate} from "react-router";

function CreateInstructor() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.INSTRUCTOR.LIST, name: 'Instructors' }, {name: 'Create Instructor' }])
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveInstructors(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(ROUTES.INSTRUCTOR.EDIT(response.data.id))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    return (
        <>
            <PageTitle title={'Create Instructor'} backTo={ROUTES.INSTRUCTOR.LIST}/>
            <InstructorForm callback={onSubmit} btnLabel={'Create'} loading={loading} create={true}/>
        </>
    )
}

export default CreateInstructor
