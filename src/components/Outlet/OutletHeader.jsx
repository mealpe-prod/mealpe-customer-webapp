import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantImage from "../../assets/1.png";
import RestroLogo from "../../assets/resto.png";
import WeeklyMenuModal from "./WeeklyMenuModal";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const OutletHeader = ({
  outletDetails,
  weeklyMenu,
  availableMealTypes,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [showOutletInfo, setShowOutletInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Truncate text function
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="relative">
      {/* Header Image Section */}
      <div className="relative h-64 overflow-hidden">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate("/home")}
            className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer shadow-md active:scale-95 transition-transform duration-200"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Header action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Info button */}
          <button
            onClick={() => setShowOutletInfo(!showOutletInfo)}
            className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer shadow-md active:scale-95 transition-transform duration-200"
          >
            <InfoOutlinedIcon fontSize="small" />
          </button>

          {/* View Menu button for mess */}
          {outletDetails.hasMess && (
            <button
              onClick={() => setIsMenuModalOpen(true)}
              className="bg-[#FF583A] text-white px-4 py-2 rounded-lg font-medium text-sm active:scale-95 cursor-pointer transition-transform duration-200 shadow-md"
            >
              View Menu
            </button>
          )}
        </div>

        {/* Header Image */}
        <img
          src={outletDetails.headerImage || RestaurantImage}
          alt={outletDetails.outletName}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </div>

      {/* Outlet Information Card - Positioned below the image */}
      <div className="bg-white mx-2 -mt-12 relative z-20 rounded-lg shadow-md p-3">
        <div className="flex items-start gap-4">
          {/* Outlet Logo */}
          <div 
            className="w-12 md:w-20 h-12 md:h-20 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm bg-white flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setShowOutletInfo(true)}
          >
            <img
              src={outletDetails.logo || RestroLogo}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Outlet Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-md md:text-xl font-bold text-gray-900 mb-1 truncate">
                  {outletDetails.outletName}
                </h1>
                
                {/* Address */}
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  {/* <LocationOnIcon style={{ fontSize: '16px' }} /> */}
                  <span className="text-xs break-words">
                    {outletDetails.address}
                  </span>
                </div>
                
                {/* Opening hours */}
                {/* <div className="flex items-center gap-1 text-gray-600">
                  <AccessTimeIcon style={{ fontSize: '16px' }} />
                  <span className="text-sm">
                    {formatTime(outletDetails.openTime)} - {formatTime(outletDetails.closeTime)}
                  </span>
                </div> */}
              </div>
              
              {/* Rating badge */}
              {/* <div className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium shadow-sm ml-4">
                <StarIcon style={{ fontSize: '16px' }} />
                <span>4.2</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Outlet info panel */}
      {showOutletInfo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col animate-fade-in overflow-hidden">
          <div className="p-4 flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Outlet Details</h3>
              <button 
                onClick={() => setShowOutletInfo(false)}
                className="text-white p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Outlet Logo and Header Image */}
            <div className="mb-6">
              <div className="w-full h-36 rounded-lg overflow-hidden mb-4">
                <img 
                  src={outletDetails.headerImage || RestaurantImage} 
                  alt={outletDetails.outletName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white mr-4">
                  <img 
                    src={outletDetails.logo || RestroLogo} 
                    alt="logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{outletDetails.outletName}</h2>
                  <div className="flex items-center gap-1 text-white/90">
                    <StarIcon style={{ fontSize: '16px', color: '#FFD700' }} />
                    <span>4.2</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outlet Information Sections */}
            <div className="space-y-6 text-white">
              <div>
                <h4 className="text-[#FF583A] font-medium mb-2">Address</h4>
                <p className="flex items-start gap-2">
                  <LocationOnIcon style={{ fontSize: '18px' }} />
                  <span>{outletDetails.address}</span>
                </p>
              </div>
              
              <div>
                <h4 className="text-[#FF583A] font-medium mb-2">Opening Hours</h4>
                <p className="flex items-start gap-2">
                  <AccessTimeIcon style={{ fontSize: '18px' }} />
                  <span>{formatTime(outletDetails.openTime)} - {formatTime(outletDetails.closeTime)}</span>
                </p>
              </div>
              
              <div>
                <h4 className="text-[#FF583A] font-medium mb-2">Contact Information</h4>
                {outletDetails.email && (
                  <p className="mb-1">
                    <span className="font-medium">Email:</span> {outletDetails.email}
                  </p>
                )}
                {outletDetails.mobile && (
                  <p className="mb-1">
                    <span className="font-medium">Phone:</span> {outletDetails.mobile}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="text-[#FF583A] font-medium mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {outletDetails.isDineIn && (
                    <span className="text-sm bg-white/10 px-3 py-1 rounded-xl">Dine-in</span>
                  )}
                  {outletDetails.isPickUp && (
                    <span className="text-sm bg-white/10 px-3 py-1 rounded-xl">Pick-up</span>
                  )}
                  {outletDetails.isDelivery && (
                    <span className="text-sm bg-white/10 px-3 py-1 rounded-xl">Delivery</span>
                  )}
                  {outletDetails.isVeg && (
                    <span className="text-sm bg-green-500/70 px-3 py-1 rounded-xl">Veg</span>
                  )}
                  {outletDetails.isNonVeg && (
                    <span className="text-sm bg-red-500/70 px-3 py-1 rounded-xl">Non-Veg</span>
                  )}
                </div>
              </div>
              
              {outletDetails.description && (
                <div>
                  <h4 className="text-[#FF583A] font-medium mb-2">About</h4>
                  <p>{outletDetails.description}</p>
                </div>
              )}
              
              {outletDetails.FSSAI_number && (
                <div>
                  <h4 className="text-[#FF583A] font-medium mb-2">FSSAI License</h4>
                  <p>{outletDetails.FSSAI_number}</p>
                </div>
              )}
              
              {outletDetails.deepLink && (
                <div>
                  <h4 className="text-[#FF583A] font-medium mb-2">Website</h4>
                  <a 
                    href={outletDetails.deepLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Menu Modal */}
      {outletDetails.hasMess && (
        <WeeklyMenuModal
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          outletId={outletDetails.outletId}
          weeklyMenu={weeklyMenu}
          availableMealTypes={availableMealTypes}
          loading={loading}
          error={error}
        />
      )}
      
      {/* Add a fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OutletHeader;