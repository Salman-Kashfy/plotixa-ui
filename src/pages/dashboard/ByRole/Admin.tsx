import {useEffect, useState} from 'react'
// import {Row, Col} from 'react-bootstrap';
// import {FaChartPie} from "react-icons/fa";
import DashboardStat from '../../../components/DashboardStat'
// import {GetDashboard} from "../../../services/admin/dashboard.service"

const InitialStats = {
    categoryCount: '',
    userCount: '',
    pendingReportCount: '',
}

function Admin({RoleId}) {
    const [stats, setStats] = useState(InitialStats);
    useEffect( () => {
        async function fetchData(){
            let params = {role_id: RoleId}
            // await GetDashboard(params).then((data) => {
            //     if (data.status) {
            //         setStats({
            //             categoryCount: data.data.categoryCount,
            //             userCount: data.data.userCount,
            //             pendingReportCount: data.data.pendingReportCount,
            //         })
            //     } else {
            //         toast.error(data.message);
            //     }
            // }).catch((error) => {
            //     toast.error(error.response.data.message);
            // })
        }
        fetchData()
    }, [RoleId])

    return (
        <div>

        </div>
    )
}

export default Admin
