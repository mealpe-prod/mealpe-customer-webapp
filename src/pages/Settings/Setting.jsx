import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from "../../components/Loader";

const Setting = () => {
    const {user} = useSelector(state => state.auth);
    const [walletData, setWalletData] = useState(null);
    const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 1, title: 'Your profile', icon: <PersonOutlineOutlinedIcon className="text-xl text-gray-500" />, path: '/profile' },
    { id: 2, title: 'Address', icon: <LocationOnOutlinedIcon className="text-xl text-gray-500" />, path: '/address' },
    { id: 3, title: 'About us', icon: <InfoOutlinedIcon className="text-xl text-gray-500" />, externalUrl: 'https://mealpe.app/' },
    { id: 4, title: 'Privacy policy', icon: <ShieldOutlinedIcon className="text-xl text-gray-500" />, externalUrl: 'https://mealpe.app/privacy-policy/' },
    { id: 5, title: 'Terms & Conditions', icon: <DescriptionOutlinedIcon className="text-xl text-gray-500" />, externalUrl: 'https://mealpe.app/' },
    { id: 6, title: 'Account Settings', icon: <SettingsOutlinedIcon className="text-xl text-gray-500" />, path: '/account-settings' },
  ];

  // Function to handle navigation or external URL redirection
  const handleNavigation = (item) => {
    if (item.externalUrl) {
      // Open external URL in a new tab
      window.open(item.externalUrl, '_blank');
    } else if (item.path) {
      // Navigate to internal path
      navigate(item.path);
    } else {
      // Fallback to the original behavior
      navigate(`/${item.title.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      if (!user?.customerAuthUID) return;

     

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/getWalletData/${user.customerAuthUID}`
      );

      if (response.data && response.data.success) {
        setWalletData(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user?.customerAuthUID]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 bg-white">
        <button 
          onClick={() => navigate("/home")} 
          className="p-1 rounded-lg cursor-pointer"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-4 mt-6 bg-white rounded-xl p-4 shadow-sm">
        <div onClick={() => navigate("/profile")} className="flex items-center cursor-pointer active:scale-95 transition-transform duration-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<PersonOutlineOutlinedIcon className="text-3xl text-gray-400" />';
                }}
              />
            ) : (
              <PersonOutlineOutlinedIcon className="text-3xl text-gray-400" />
            )}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-bold text-gray-800">{user?.customerName}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button 
            className="text-[#FF583A] p-2 rounded-lg hover:bg-[#FFF1EE] cursor-pointer active:scale-95 transition-transform duration-200" 
            onClick={() => navigate('/profile')}
          >
            <EditOutlinedIcon className="text-lg" />
          </button>
        </div>
        
        {/* Wallet Balance */}
        <div onClick={() => navigate("/wallet")} className="flex items-center mt-4 pt-2 bg-[#FFF1EE] rounded-lg p-2 cursor-pointer active:scale-95 transition-transform duration-200">
          <AccountBalanceWalletOutlinedIcon className="text-xl text-[#FF583A]" />
          <span className="ml-2 text-sm font-medium text-[#FF583A] flex items-center">
            Wallet Balance- {loading ? <Loader color="#FF583A" size="small" className="ml-2"/> : `₹ ${walletData?.balance.toFixed(2) || 0}`}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 mt-6">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className="flex items-center px-4 py-4 bg-white border-b border-gray-100 cursor-pointer active:scale-95 transition-transform duration-200"
            onClick={() => handleNavigation(item)}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="ml-4 text-sm font-medium text-gray-800">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Setting;
