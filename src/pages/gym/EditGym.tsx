import {useEffect, useState, useContext} from 'react'
import GymForm from "./GymForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetGym,UpdateGym} from "../../services/gym.service";
import {useParams} from "react-router-dom";
import {ToastContext} from "../../hooks/ToastContext";

function EditGym() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    const onSubmit = (data) => {
        setLoading(true)
        UpdateGym(data).then((data) => {
            if(data.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(data.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.GYM.LIST, name: 'Gyms' }, {name: 'Update Gym' }])
        GetGym(id).then((gym) => {
            setRecord(gym)
            setFormLoader(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={'Update Gym'} backTo={ROUTES.GYM.LIST}/>
            <GymForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditGym
