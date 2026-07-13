import {useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import './App.css'
import {AdminContext} from './hooks/AdminContext';
import {ToastContext} from './hooks/ToastContext';
import {constants, ROUTES, PERMISSIONS} from "./utils/constants";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// App Layout
import AuthLayoutRoute from "./layouts/AuthLayout";
import DashboardLayoutRoute from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Signin from "./pages/auth/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CreateBrand from "./pages/brand/CreateBrand";
import EditBrand from "./pages/brand/EditBrand";
import Brand from "./pages/brand/Brand";
import ViewBrand from "./pages/brand/ViewBrand";
import Gym from "./pages/gym/Gym";
import ViewGym from "./pages/gym/ViewGym";
import CreateGym from "./pages/gym/CreateGym";
import EditGym from "./pages/gym/EditGym";
import Lead from "./pages/lead/Lead";
import CreateLead from "./pages/lead/CreateLead";
import EditLead from "./pages/lead/EditLead";
import ViewLead from "./pages/lead/ViewLead2";
import Instructor from "./pages/instructor/Instructor";
import ViewInstructor from "./pages/instructor/ViewInstructor";
import CreateInstructor from "./pages/instructor/CreateInstructor";
import EditInstructor from "./pages/instructor/EditInstructor";
import Service from "./pages/service/Service";
import MembershipPlanGroup from "./pages/membership-plan-group/MembershipPlanGroup";
import ViewPlanGroup from "./pages/membership-plan-group/ViewPlanGroup";
import MembershipPlan from "./pages/membership-plan/MembershipPlan";
import ViewMembershipPlan from "./pages/membership-plan/ViewMembershipPlan";
import PaymentPlan from "./pages/payment-plan/PaymentPlan";
import ViewPaymentPlan from "./pages/payment-plan/ViewPaymentPlan";
import CreateService from "./pages/service/CreateService";
import EditService from "./pages/service/EditService";
import ViewService from "./pages/service/ViewService";
import CreatePlanGroup from "./pages/membership-plan-group/CreatePlanGroup";
import EditPlanGroup from "./pages/membership-plan-group/EditPlanGroup";
import CreateMembershipPlan from "./pages/membership-plan/CreateMembershipPlan";
import EditMembershipPlan from "./pages/membership-plan/EditMembershipPlan";
import CreatePaymentPlan from "./pages/payment-plan/CreatePaymentPlan";
import EditPaymentPlan from "./pages/payment-plan/EditPaymentPlan";
import Customer from "./pages/customer/Customer";
import EditCustomer from "./pages/customer/EditCustomer";
import ViewCustomer from "./pages/customer/ViewCustomer";
import Admin from "./pages/admin/Admin";
import CreateAdmin from "./pages/admin/CreateAdmin";
import EditAdmin from "./pages/admin/EditAdmin";
import ViewAdmin from "./pages/admin/ViewAdmin";
import GymClass from "./pages/gymClass/GymClass";
import EditGymClass from "./pages/gymClass/EditGymClass";
import CreateGymClass from "./pages/gymClass/CreateGymClass";
import ViewGymClass from "./pages/gymClass/ViewGymClass";
import GymClassSchedule from "./pages/gym-class-schedule/GymClassSchedule";
import EditGymClassSchedule from "./pages/gym-class-schedule/EditGymClassSchedule";
import CreateGymClassSchedule from "./pages/gym-class-schedule/CreateGymClassSchedule";
import ViewGymClassSchedule from "./pages/gym-class-schedule/ViewGymClassSchedule";
import Discount from "./pages/discount/Discount";
import EditDiscount from "./pages/discount/EditDiscount";
import CreateDiscount from "./pages/discount/CreateDiscount";
import ViewDiscount from "./pages/discount/ViewDiscount";
import Calendar from "./pages/calendar/Calendar";
import SalesReport from "./pages/reports/SalesReport";
import GymQrSession from "./pages/gym-qr-sessions/GymQrSession";
import AllMembership from "./pages/membership/AllMembership";
import Invitation from "./pages/auth/Invitation";
import GymOptions from "./pages/gym/GymOptions";
import Billing from "./pages/subscription/Billing";
import GymActivation from "./pages/brand/GymActivation";
import SubscriptionPayment from "./pages/subscription-payment/SubscriptionPayment";
import Subscription from "./pages/subscription/Subscription";
import Expense from "./pages/expense/Expense";
import CreateExpense from "./pages/expense/CreateExpense";
import PTCommission from "./pages/commission/PTCommission";
import PTCommissionReport from "./pages/reports/PTCommissionReport";

// Supporting Components
import PermissionDenied from "./components/PermissionDenied";

function App() {
    /**
    * Admin Context
    * */
    const storageKey = constants.LOCAL_STORAGE_TOKEN;
    const storageAdmin = constants.LOCAL_STORAGE_ADMIN;
    const storagePermission = constants.LOCAL_STORAGE_PERMISSIONS;
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(storageAdmin));
    const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem(storageAdmin)) || {});
    const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem(storagePermission)) || []);
    const [token, setToken] = useState(localStorage.getItem(storageKey) ? localStorage.getItem(storageKey) : false);
    const userData = {loggedIn, admin, permissions, token, setLoggedIn, setAdmin, setToken, setPermissions};

    /**
     * Toast Context
     * */
    const [toast, setToast] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('info');
    const [toastMessage, setToastMessage] = useState('');
    const toastData = { toast, setToast, toastSeverity, setToastSeverity, toastMessage, setToastMessage }

    const stripePromise = loadStripe(constants.STRIPE_PUBLIC_KEY);

    return (
        <AdminContext.Provider value={userData}>
            <ToastContext.Provider value={toastData}>
                <Elements stripe={stripePromise}>
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
                            <Route path={ROUTES.BRAND.ACTIVATION()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymActivation} permissionName={PERMISSIONS.BRAND.UPDATE} />} />
                            <Route path={ROUTES.GYM.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Gym} permissionName={PERMISSIONS.GYM.LIST} />} />
                            <Route path={ROUTES.GYM.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateGym} permissionName={PERMISSIONS.GYM.CREATE} />} />
                            <Route path={ROUTES.GYM.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditGym} permissionName={PERMISSIONS.GYM.UPDATE} />} />
                            <Route path={ROUTES.GYM.OPTIONS()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymOptions} permissionName={PERMISSIONS.GYM.UPDATE} />} />
                            <Route path={ROUTES.LEAD.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Lead} permissionName={PERMISSIONS.LEAD.LIST} />} />
                            <Route path={ROUTES.LEAD.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateLead} permissionName={PERMISSIONS.LEAD.UPSERT} />} />
                            <Route path={ROUTES.LEAD.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditLead} permissionName={PERMISSIONS.LEAD.UPSERT} />} />
                            <Route path={ROUTES.LEAD.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewLead} permissionName={PERMISSIONS.LEAD.LIST} />} />
                            <Route path={ROUTES.CUSTOMER.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Customer} permissionName={PERMISSIONS.CUSTOMER.LIST} />} />
                            <Route path={ROUTES.CUSTOMER.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditCustomer} permissionName={PERMISSIONS.CUSTOMER.UPSERT} />} />
                            <Route path={ROUTES.CUSTOMER.TAB()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewCustomer} permissionName={PERMISSIONS.CUSTOMER.LIST} />} />
                            <Route path={ROUTES.INSTRUCTOR.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Instructor} permissionName={PERMISSIONS.INSTRUCTOR.LIST} />} />
                            <Route path={ROUTES.INSTRUCTOR.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateInstructor} permissionName={PERMISSIONS.INSTRUCTOR.UPSERT} />} />
                            <Route path={ROUTES.INSTRUCTOR.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditInstructor} permissionName={PERMISSIONS.INSTRUCTOR.UPSERT} />} />
                            <Route path={ROUTES.INSTRUCTOR.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewInstructor} permissionName={PERMISSIONS.INSTRUCTOR.LIST} />} />
                            <Route path={ROUTES.SERVICE.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Service} permissionName={PERMISSIONS.SERVICE.LIST} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN_GROUP.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={MembershipPlanGroup} permissionName={PERMISSIONS.MEMBERSHIP_PLAN_GROUP.LIST} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN_GROUP.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreatePlanGroup} permissionName={PERMISSIONS.MEMBERSHIP_PLAN_GROUP.UPSERT} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN_GROUP.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditPlanGroup} permissionName={PERMISSIONS.MEMBERSHIP_PLAN_GROUP.UPSERT} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN_GROUP.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewPlanGroup} permissionName={PERMISSIONS.MEMBERSHIP_PLAN_GROUP.LIST} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={MembershipPlan} permissionName={PERMISSIONS.MEMBERSHIP_PLAN.LIST} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateMembershipPlan} permissionName={PERMISSIONS.MEMBERSHIP_PLAN.UPSERT} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditMembershipPlan} permissionName={PERMISSIONS.MEMBERSHIP_PLAN.UPSERT} />} />
                            <Route path={ROUTES.MEMBERSHIP_PLAN.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewMembershipPlan} permissionName={PERMISSIONS.MEMBERSHIP_PLAN.LIST} />} />
                            <Route path={ROUTES.PAYMENT_PLAN.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={PaymentPlan} permissionName={PERMISSIONS.PAYMENT_PLAN.LIST} />} />
                            <Route path={ROUTES.PAYMENT_PLAN.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditPaymentPlan} permissionName={PERMISSIONS.PAYMENT_PLAN.UPSERT} />} />
                            <Route path={ROUTES.PAYMENT_PLAN.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewPaymentPlan} permissionName={PERMISSIONS.PAYMENT_PLAN.LIST} />} />
                            <Route path={ROUTES.PAYMENT_PLAN.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreatePaymentPlan} permissionName={PERMISSIONS.PAYMENT_PLAN.UPSERT} />} />
                            <Route path={ROUTES.SERVICE.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateService} permissionName={PERMISSIONS.SERVICE.UPSERT} />} />
                            <Route path={ROUTES.SERVICE.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditService} permissionName={PERMISSIONS.SERVICE.UPSERT} />} />
                            <Route path={ROUTES.SERVICE.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewService} permissionName={PERMISSIONS.SERVICE.LIST} />} />
                            <Route path={ROUTES.BRAND.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewBrand} permissionName={PERMISSIONS.BRAND.LIST} />} />
                            <Route path={ROUTES.GYM.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewGym} permissionName={PERMISSIONS.GYM.LIST} />} />
                            <Route path={ROUTES.ADMIN.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Admin} permissionName={PERMISSIONS.ADMIN.LIST} />} />
                            <Route path={ROUTES.ADMIN.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateAdmin} permissionName={PERMISSIONS.ADMIN.UPSERT} />} />
                            <Route path={ROUTES.ADMIN.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditAdmin} permissionName={PERMISSIONS.ADMIN.UPSERT} />} />
                            <Route path={ROUTES.ADMIN.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewAdmin} permissionName={PERMISSIONS.ADMIN.LIST} />} />
                            <Route path={ROUTES.CLASS.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymClass} permissionName={PERMISSIONS.CLASS.LIST} />} />
                            <Route path={ROUTES.CLASS.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditGymClass} permissionName={PERMISSIONS.CLASS.UPSERT} />} />
                            <Route path={ROUTES.CLASS.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateGymClass} permissionName={PERMISSIONS.CLASS.UPSERT} />} />
                            <Route path={ROUTES.CLASS.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewGymClass} permissionName={PERMISSIONS.CLASS.LIST} />} />
                            <Route path={ROUTES.CLASS_SCHEDULE.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymClassSchedule} permissionName={PERMISSIONS.CLASS_SCHEDULE.LIST} />} />
                            <Route path={ROUTES.CLASS_SCHEDULE.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditGymClassSchedule} permissionName={PERMISSIONS.CLASS_SCHEDULE.UPSERT} />} />
                            <Route path={ROUTES.CLASS_SCHEDULE.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateGymClassSchedule} permissionName={PERMISSIONS.CLASS_SCHEDULE.UPSERT} />} />
                            <Route path={ROUTES.CLASS_SCHEDULE.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewGymClassSchedule} permissionName={PERMISSIONS.CLASS_SCHEDULE.LIST} />} />
                            <Route path={ROUTES.DISCOUNT.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Discount} permissionName={PERMISSIONS.DISCOUNT.LIST} />} />
                            <Route path={ROUTES.DISCOUNT.EDIT()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={EditDiscount} permissionName={PERMISSIONS.DISCOUNT.UPSERT} />} />
                            <Route path={ROUTES.DISCOUNT.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateDiscount} permissionName={PERMISSIONS.DISCOUNT.UPSERT} />} />
                            <Route path={ROUTES.DISCOUNT.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={ViewDiscount} permissionName={PERMISSIONS.DISCOUNT.LIST} />} />
                            <Route path={ROUTES.CALENDAR.VIEW} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Calendar} />} />
                            <Route path={ROUTES.REPORT.SALES} exact={true} element={<DashboardLayoutRoute isAuth={true} component={SalesReport} permissionName={PERMISSIONS.PAYMENT.LIST} />} />
                            <Route path={ROUTES.GYM_QR_SESSION.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={GymQrSession} permissionName={PERMISSIONS.GYM_QR_SESSION.LIST} />} />
                            <Route path={ROUTES.MEMBERSHIP.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={AllMembership} permissionName={PERMISSIONS.MEMBERSHIP.LIST} />} />
                            <Route path={ROUTES.SUBSCRIPTION.VIEW} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Subscription} permissionName={PERMISSIONS.SUBSCRIPTION.BILLING} />} />
                            <Route path={ROUTES.SUBSCRIPTION.BILLING} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Billing} permissionName={PERMISSIONS.SUBSCRIPTION.BILLING} />} />
                            <Route path={ROUTES.SUBSCRIPTION.PAYMENT} exact={true} element={<DashboardLayoutRoute isAuth={true} component={SubscriptionPayment} permissionName={PERMISSIONS.SUBSCRIPTION.PAYMENT} />} />
                            <Route path={ROUTES.EXPENSE.LIST} exact={true} element={<DashboardLayoutRoute isAuth={true} component={Expense} permissionName={PERMISSIONS.EXPENSE.LIST} />} />
                            <Route path={ROUTES.EXPENSE.CREATE} exact={true} element={<DashboardLayoutRoute isAuth={true} component={CreateExpense} permissionName={PERMISSIONS.EXPENSE.UPSERT} />} />
                            <Route path={ROUTES.PT_COMMISSION.VIEW()} exact={true} element={<DashboardLayoutRoute isAuth={true} component={PTCommission} permissionName={PERMISSIONS.PT_COMMISSION.VIEW} />} />
                            <Route path={ROUTES.REPORT.PT_COMMISSION} exact={true} element={<DashboardLayoutRoute isAuth={true} component={PTCommissionReport} permissionName={PERMISSIONS.REPORT.PT_COMMISSION} />} />
                        </Routes>
                    </Router>
                </Elements>
            </ToastContext.Provider>
        </AdminContext.Provider>
    )
}

export default App