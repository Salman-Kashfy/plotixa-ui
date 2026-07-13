import {useContext, useEffect, useState} from 'react'
import CustomerForm from "../customer/CustomerForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetCustomer,UpdateCustomer} from "../../services/customer.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";
import { electronAPI } from "../../utils/electron";
import { GetToken } from "../../services/auth/auth.service";
import { constants } from "../../utils/constants";

function EditCustomer() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const { id } = useParams();
    const [record, setRecord] = useState<any>({});

    const fetchCustomer = async () => {
        return new Promise((resolve) => {
            GetCustomer(id).then((customer) => {
                setRecord(customer)
                setFormLoader(false)
                resolve(customer)
            })
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CUSTOMER.LIST, name: 'Customers' }, {name: 'Edit Customer' }])
        fetchCustomer()
    }, []);

    const onSubmit = (data:any) => {
        setLoading(true)
        UpdateCustomer(data).then((response) => {
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

    const syncBiometric = async () => {
        if (!record.gym?.deviceIp) return;
        setSyncLoading(true);
        try {
            const syncResult = await electronAPI.syncBiometric({
                deviceIp: record.gym.deviceIp,
                fullName: record.fullName || '',
                customerId: record.id || '',
                gymId: record.gymId || '',
                token: GetToken() || '',
                apiBaseUrl: constants.API_URL || '',
                autoCleanup: false  // Disable automatic cleanup
            });
            
            if(syncResult.success){
                // Refresh customer data to get updated biometricUserId
                await fetchCustomer();
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Synced successfully');
                toastContext.setToast(true);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(syncResult.message || 'Failed to sync biometric');
                toastContext.setToast(true);
            }
        } catch (error: any) {
            // Error on syncing biometric
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error.message || 'Failed to sync biometric');
            toastContext.setToast(true);
        } finally {
            setSyncLoading(false);
        }
    }

    const enrollBiometric = async () => {
        if (!record.gym?.deviceIp) return;
        setSyncLoading(true);
        try {
            const enrollResult = await electronAPI.enrollBiometric({
                deviceIp: record.gym.deviceIp,
                biometricUserId: record.biometricUserId || '',
                biometricUid: record.biometricUid || '',
            });
            if(enrollResult.success){
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Ready for fingerprint');
                toastContext.setToast(true);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(enrollResult.message || 'Failed to open screen');
                toastContext.setToast(true);
            }
        } catch (error: any) {
            // Failed to open screen
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error.message || 'Failed to sync biometric');
            toastContext.setToast(true);
        } finally {
            setSyncLoading(false);
        }
    }

    const unsyncBiometric = async () => {
        if (!record.gym?.deviceIp || !record.biometricUid) return;
        
        // Check if the function exists (removed debug logs)
        if (!window.electronAPI?.unsyncBiometric) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Unsync function not available. Please restart the application.');
            toastContext.setToast(true);
            return;
        }
        
        setSyncLoading(true);
        try {
            const unsyncResult = await electronAPI.unsyncBiometric({
                deviceIp: record.gym.deviceIp,
                biometricUid: record.biometricUid || '',
                customerId: record.id || '',
                gymId: record.gymId || '',
                token: GetToken() || '',
                apiBaseUrl: constants.API_URL || ''
            });
            
            if(unsyncResult.success){
                // Refresh customer data to get updated biometric fields (should be cleared)
                await fetchCustomer();
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('User removed from biometric device successfully');
                toastContext.setToast(true);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(unsyncResult.message || 'Failed to remove user from biometric device');
                toastContext.setToast(true);
            }
        } catch (error: any) {
            // Error on unsyncing biometric
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage(error.message || 'Failed to remove user from biometric device');
            toastContext.setToast(true);
        } finally {
            setSyncLoading(false);
        }
    }

    return (
        <>
            <PageTitle title={'Edit Customer'} backTo={ROUTES.CUSTOMER.LIST}/>
            <CustomerForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader} syncLoading={syncLoading} syncBiometric={syncBiometric} enrollBiometric={enrollBiometric} unsyncBiometric={unsyncBiometric}/>
        </>
    )
}

export default EditCustomer
