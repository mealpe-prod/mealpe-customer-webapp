import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MessScheduleModal = ({ 
  showScheduleModal, 
  setShowScheduleModal, 
  handleConfirmSchedule, 
  outletDetails 
}) => {
  const user = useSelector((state) => state.auth.user);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const items = useSelector((state) => state.cart.items);

  const menuTypeId = {
    "Breakfast": 1,
    "Lunch": 2,
    "High Tea": 3,
    "Dinner": 4,
  };

  useEffect(() => {
    if (showScheduleModal && outletDetails?.outdetails?.hasMess) {
      getAvailableScheduleableDates();
    }
  }, [showScheduleModal, outletDetails]);

  const getAvailableScheduleableDates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}mess/rsvp/getAvailableScheduleableDates`, {
        outletId: outletDetails?.outdetails?.outletId,
        customerAuthUID: user?.customerAuthUID,
        mealTypeId: menuTypeId[items[0]?.name]
      });
      
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setAvailableDates(response.data.data);
      } else {
        setError('Failed to fetch available dates');
        console.log("Invalid response format:", response.data);
      }
    } catch (error) {
      setError('Error fetching available dates');
      console.log("Error fetching available dates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDate = (dateObj) => {
    setSelectedDateObj(dateObj);
  };

  const handleConfirm = () => {
    if (selectedDateObj) {
      handleConfirmSchedule(selectedDateObj);
    }
  };

  // Helper function to display price
  const displayPrice = (price) => {
    if (price === null) {
      return 'N/A';
    } else if (price === 0) {
      return 'Free';
    } else {
      return `₹${price}`;
    }
  };

  // Check if a date can be selected
  const canSelectDate = (dateObj) => {
    return !dateObj.alreadyPurchased && !dateObj.timesUp;
  };

  if (!showScheduleModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
      <div className="bg-white rounded-[12px] w-[90%] max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Schedule Order</h2>
          <button 
            onClick={() => setShowScheduleModal(false)}
            className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF583A]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : (
            availableDates.map((dateObj, index) => (
              <div 
                key={index}
                className={`mb-3 p-4 border rounded-[12px] ${
                  selectedDateObj?.orderDate === dateObj.orderDate 
                    ? 'border-[#FF583A] bg-[#FFF1EE]' 
                    : !canSelectDate(dateObj)
                      ? 'border-gray-200 opacity-70'
                      : 'border-gray-200'
                } cursor-pointer transition-all duration-300`}
                onClick={() => canSelectDate(dateObj) && handleSelectDate(dateObj)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-base font-medium">{dateObj.formattedDate}</div>
                    <div className="text-sm text-gray-600">{dateObj.dayName}</div>
                  </div>
                  <div className="text-right">
                    {/* <div className="text-sm font-medium">{displayPrice(dateObj.price)}</div> */}
                    <div className="text-xs text-gray-600">{dateObj.orderTime}</div>
                  </div>
                </div>
                {dateObj.alreadyPurchased && (
                  <div className="mt-2 text-xs text-green-600 font-medium">Already purchased</div>
                )}
                {dateObj.timesUp && (
                  <div className="mt-2 text-xs text-red-600 font-medium">Time's up</div>
                )}
              </div>
            ))
          )}
          
          {availableDates.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              No available dates for scheduling
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleConfirm}
            disabled={!selectedDateObj || !canSelectDate(selectedDateObj)}
            className={`w-full py-3 rounded-[12px] font-medium active:scale-95 transition-all duration-300 ${
              !selectedDateObj || !canSelectDate(selectedDateObj)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#FF583A] text-white cursor-pointer'
            }`}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessScheduleModal; 