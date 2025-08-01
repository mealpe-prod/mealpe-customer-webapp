import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import brandLogo from "../assets/brandLogo.png";
import Avatar from "../assets/avatar.png";
import InstallAppButton from "./InstallAppButton";
import ProfileSvg from "./Svgs/ProfileSvg";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading,setIsLoading] = useState(false);
  const [walletBalance,setWalletBalance] = useState(0);

  // Check for desktop screen size
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && e.target.classList.contains("sidebar-overlay")) {
        onClose();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onClose]);

  // Handle logout directly
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    localStorage.removeItem('campusId');
    localStorage.removeItem('cityId');
    localStorage.removeItem('organizationCode');
    navigate("/login");
    onClose();
  };

  // Handle showing logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      // Fetch wallet balance
      const userId = user?.customerAuthUID;
      const balanceResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/getWalletData/${user.customerAuthUID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const balanceData = await balanceResponse.json();
      if (!balanceData.success) {
        console.error('Error fetching wallet balance:', balanceData.message);
        Toast.error(balanceData.message);
        setIsLoading(false);
        return;
      }
      // console.log(balanceData);
      setWalletBalance(balanceData.response.balance || 0);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  },[user]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 sidebar-overlay ${
          isOpen ? "opacity-60" : "opacity-0 pointer-events-none"
        }`}
      />
      
      {/* Close button outside sidebar */}
      {/* {isOpen && (
        <button 
          onClick={onClose} 
          className={`fixed top-4 p-1 z-[60] text-white bg-orange-200 rounded-full hover:text-gray-200 cursor-pointer active:scale-95 transition-transform duration-200 ${
            isDesktop ? 'right-4' : 'left-66'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )} */}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 h-full w-[80%] max-w-xs bg-gradient-to-b from-[#FF583A] to-[#e54c30] z-50 transform transition-transform duration-300 ease-in-out shadow-xl lg:max-w-sm flex flex-col
          ${isDesktop ? 'right-0' : 'left-0'}
          ${isOpen 
            ? "translate-x-0" 
            : isDesktop 
              ? "translate-x-full" 
              : "-translate-x-full"
          }`}
      >
        {/* Header Section with User Info */}
        <div className="p-3 lg:p-4">
          {/* User Profile Section */}
          <div className="flex items-center mb-3">
            <div className="w-14 h-14 bg-white rounded-full overflow-hidden mr-2 lg:w-12 lg:h-12 lg:mr-3 border-2 border-white shadow-md">
              <img 
                src={user?.photo || Avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = Avatar;
                }}
              />
            </div>
            <div>
              <h2 className="text-white text-base font-medium">Welcome</h2>
              <p className="text-white text-base font-semibold">{user?.customerName || "Ajay"}</p>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-[12px] p-3 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-700 text-xs font-medium mb-1">Wallet Balance</h3>
                <p className="text-black text-lg font-bold">₹ {walletBalance?.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 bg-[#FF583A] rounded-[8px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Items Section with White Background */}
        <div className="flex-1 bg-white rounded-t-[20px]">
          <nav className="p-2 lg:p-3 overflow-y-auto h-full pb-20">
            <ul className="space-y-1 lg:space-y-1">
              {/* Profile */}
              <li>
                <button 
                  onClick={() => {
                    navigate("/profile");
                    onClose();
                  }}
                  className="flex items-center w-full p-2 hover:bg-[#FFF1EE] rounded-[12px] lg:p-2.5 cursor-pointer active:scale-95 transition-transform duration-200"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 text-black lg:w-8 lg:h-8 lg:mr-3">
                   <ProfileSvg color="#000000" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Profile</span>
                </button>
              </li>
              
              {/* Favorites */}
              <li>
                <button 
                  onClick={() => {
                    navigate("/favorites");
                    onClose();
                  }}
                  className="flex items-center w-full p-2 hover:bg-[#FFF1EE] rounded-[12px] lg:p-2.5 transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 text-black lg:w-8 lg:h-8 lg:mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Favorites</span>
                </button>
              </li>
              
              {/* Offers */}
              <li>
                <button 
                  onClick={() => {
                    navigate("/offers");
                    onClose();
                  }}
                  className="flex items-center w-full p-2 hover:bg-[#FFF1EE] rounded-[12px] lg:p-2.5 duration-200 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 text-black lg:w-8 lg:h-8 lg:mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Offers</span>
                </button>
              </li>
              
              {/* Contact Us */}
              <li>
                <button 
                  onClick={() => {
                    navigate("/contact-us");
                    onClose();
                  }}
                  className="flex items-center w-full p-2 hover:bg-[#FFF1EE] rounded-[12px] lg:p-2.5 active:scale-95 transition-transform duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 text-black lg:w-8 lg:h-8 lg:mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                    <span className="text-sm font-medium text-gray-800">Contact Us</span>
                </button>
              </li>
              
              {/* Settings */}
              <li>
                <button 
                  onClick={() => {
                    navigate("/settings");
                    onClose();
                  }}
                  className="flex items-center w-full p-2 hover:bg-[#FFF1EE] rounded-[12px] lg:p-2.5 active:scale-95 transition-transform duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 text-black lg:w-8 lg:h-8 lg:mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Settings</span>
                </button>
              </li>
              
              {/* Logout */}
              <li>
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center w-full p-2 hover:bg-red-50 rounded-[12px] text-red-500 lg:p-2.5 active:scale-95 transition-transform duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 lg:w-8 lg:h-8 lg:mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </li>
            </ul>

            {/* Install App Button */}
            <div className="mt-4 w-full active:scale-95 transition-transform duration-200">
              <InstallAppButton 
                className="w-full" 
                buttonText="Install App"
              />
            </div>
            
            {/* Logo */}
            <div className="mt-18 w-full flex justify-center lg:hidden active:scale-95 transition-transform duration-200">
              <div className="flex items-center cursor-pointer">
                <img onClick={() => window.open("https://www.mealpe.app", "_blank")} src={brandLogo} alt="MealPe" className="h-8" />
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
          <div className="bg-white rounded-[12px] w-[85%] max-w-sm p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-5 text-sm">Are you sure you want to log out of your account?</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="px-4 py-2 border border-gray-300 text-sm rounded-[8px] text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-[#FF583A] text-white text-sm rounded-[8px] hover:bg-[#e54c30] active:scale-95 transition-transform duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;