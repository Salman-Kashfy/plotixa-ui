import {useEffect, useState, useContext} from 'react'
import InstructorForm from "./InstructorForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ToastContext} from '../../hooks/ToastContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {SaveInstructors,GetInstructor} from "../../services/instructor.service";
import {useParams} from "react-router-dom";

function EditInstructor() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.INSTRUCTOR.LIST, name: 'Instructors' }, {name: 'Update Instructor' }])
        GetInstructor(id).then((instructor) => {
            setRecord(instructor)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        SaveInstructors(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
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
            <PageTitle title={'Update Instructor'} backTo={ROUTES.INSTRUCTOR.LIST}/>
            <InstructorForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditInstructor
