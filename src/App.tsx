import {useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import './App.css'
import {AdminContext} from './hooks/AdminContext';
import {ToastContext} from './hooks/ToastContext';
import {constants, ROUTES, PERMISSIONS} from "./utils/constants";

// App Layout
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Invitation from "./pages/auth/Invitation";
import Brand from "./pages/brand/Brand";
import CreateBrand from "./pages/brand/CreateBrand";
import EditBrand from "./pages/brand/EditBrand";
import ViewBrand from "./pages/brand/ViewBrand";
import GymActivation from "./pages/brand/GymActivation";
import Expense from "./pages/expense/Expense";
import CreateExpense from "./pages/expense/CreateExpense";
import EditExpense from "./pages/expense/EditExpense";
import Plot from "./pages/plot/Plot";
import CreatePlot from "./pages/plot/CreatePlot";
import EditPlot from "./pages/plot/EditPlot";
import Customer from "./pages/customer/Customer";
import CreateCustomer from "./pages/customer/CreateCustomer";
import EditCustomer from "./pages/customer/EditCustomer";

// Supporting Components
import PermissionDenied from "./components/PermissionDenied";

function App() {
    const storageKey = constants.LOCAL_STORAGE_TOKEN;
    const storageAdmin = constants.LOCAL_STORAGE_ADMIN;
    const storagePermission = constants.LOCAL_STORAGE_PERMISSIONS;
    const storageProjectUuid = constants.PROJECT_UUID;
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(storageAdmin));
    const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem(storageAdmin)) || {});
    const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem(storagePermission)) || []);
    const [token, setToken] = useState(localStorage.getItem(storageKey) ? localStorage.getItem(storageKey) : false);
    const [projectUuid, setProjectUuid] = useState(localStorage.getItem(storageProjectUuid) ? localStorage.getItem(storageProjectUuid) : '');
    const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('USER_PROJECTS')) || []);
    const userData = {loggedIn, admin, permissions, token, projectUuid, projects, setLoggedIn, setAdmin, setToken, setPermissions, setProjectUuid, setProjects};

    const [toast, setToast] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('info');
    const [toastMessage, setToastMessage] = useState('');
    const toastData = { toast, setToast, toastSeverity, setToastSeverity, toastMessage, setToastMessage }

    return (
        <AdminContext.Provider value={userData}>
            <ToastContext.Provider value={toastData}>
                <Router>
                    <Routes>
                        <Route path={ROUTES.DASHBOARD} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Dashboard} />} />
                        <Route path={ROUTES.FORBIDDEN} exact={true} element={<DashboardLayoutRoute isAuth={true} component={PermissionDenied} permissionName={false} />} />
                        <Route path={ROUTES.AUTH.LOGIN} exact={true} element={<AuthLayoutRoute isAuth={false} component={Signin} />} />
                        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} exact={true} element={<AuthLayoutRoute isAuth={false} component={ForgotPassword} />} />
                        <Route path={ROUTES.AUTH.INVITATION} exact={true} element={<AuthLayoutRoute isAuth={false} component={Invitation} />} />
                        <Route path={ROUTES.BRAND.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Brand} permissionName={PERMISSIONS.BRAND.LIST} />} />
                        <Route path={ROUTES.BRAND.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateBrand} permissionName={PERMISSIONS.BRAND.CREATE} />} />
                        <Route path={ROUTES.BRAND.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditBrand} permissionName={PERMISSIONS.BRAND.UPDATE} />} />
                        <Route path={ROUTES.BRAND.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewBrand} permissionName={PERMISSIONS.BRAND.LIST} />} />
                        <Route path={ROUTES.BRAND.ACTIVATION()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymActivation} permissionName={PERMISSIONS.BRAND.UPDATE} />} />
                        <Route path={ROUTES.EXPENSE.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Expense} permissionName={PERMISSIONS.EXPENSE.LIST} />} />
                        <Route path={ROUTES.EXPENSE.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateExpense} permissionName={PERMISSIONS.EXPENSE.CREATE} />} />
                        <Route path={ROUTES.EXPENSE.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditExpense} permissionName={PERMISSIONS.EXPENSE.UPDATE} />} />
                        <Route path={ROUTES.PLOT.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Plot} permissionName={PERMISSIONS.PLOT.LIST} />} />
                        <Route path={ROUTES.PLOT.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreatePlot} permissionName={PERMISSIONS.PLOT.CREATE} />} />
                        <Route path={ROUTES.PLOT.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditPlot} permissionName={PERMISSIONS.PLOT.UPDATE} />} />
                        <Route path={ROUTES.CUSTOMER.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Customer} permissionName={PERMISSIONS.CUSTOMER.LIST} />} />
                        <Route path={ROUTES.CUSTOMER.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateCustomer} permissionName={PERMISSIONS.CUSTOMER.CREATE} />} />
                        <Route path={ROUTES.CUSTOMER.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditCustomer} permissionName={PERMISSIONS.CUSTOMER.UPDATE} />} />
                    </Routes>
                </Router>
            </ToastContext.Provider>
        </AdminContext.Provider>
    )
}

export default App