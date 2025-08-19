import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';

// Import your components
import Home from '../pages/Home/Home';
import Login from '../pages/Auth/Login';
import Profile from '../pages/Profile/Profile';
import NotFound from '../pages/NotFound/NotFound';
import SplashScreen from '../screens/SplashScreen'; 
import OTPVerification from '../pages/Auth/OTPVerification';
import Favorites from '../pages/Favorite/Favorites';
import Orders from '../pages/OrderHistory/Orders';
import OrderDetail from '../pages/OrderHistory/OrderDetail';
import Cart from '../pages/Cart/Cart';
import ScheduleOrder from '../pages/ScheduleOrder/ScheduleOrder';
import Setting from '../pages/Settings/Setting';
import Offers from '../pages/Offers/Offers';
import AccountSetting from '../pages/Settings/AccountSetting';
import Wallet from '../pages/Wallet/Wallet';
import ContactUs from '../pages/Settings/ContactUs';
import SignUp from '../pages/Auth/SignUp';
import SelectCity from '../pages/Location/SelectCity';
import SelectCampus from '../pages/Location/SelectCampus';
import OutletDetails from '../pages/Outlet/OutletDetails';
import ItemDetails from '../pages/Outlet/ItemDetails';
import MessDetails from '../pages/Mess/MessDetails';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';
import AllowLocation from '../pages/Location/AllowLocation';
import OrderReview from '../pages/OrderHistory/OrderReview';
import Address from '../pages/Settings/Address';
import ResetDeviceTime from '../pages/Mess/ResetDeviceTime';

const AppRouter = () => {
  const { user, loading } = useSelector(state => state.auth);

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF583A]"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <SplashScreen />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/select-city" element={<SelectCity />} />
        <Route path="/select-campus/:cityId" element={<SelectCampus />} />
        <Route path="/allow-location" element={<AllowLocation />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<Address />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/orders" element={<Orders />} /> 
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/orders/review" element={<OrderReview />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/account-settings" element={<AccountSetting />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/schedule-order" element={<ScheduleOrder />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/outlet/:outletId" element={<OutletDetails />} />
          <Route path="/outlet/:outletId/:itemId" element={<ItemDetails />} />
          <Route path="/mess/:outletId" element={<MessDetails />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/device-time" element={<ResetDeviceTime />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter; 