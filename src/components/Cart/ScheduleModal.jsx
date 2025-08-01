import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';

const ScheduleModal = ({ 
  showScheduleModal, 
  setShowScheduleModal, 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime, 
  scheduleError, 
  getFormattedDate, 
  handleConfirmSchedule, 
  outletDetails 
}) => {
  const user = useSelector((state) => state.auth.user);
  if (!showScheduleModal) return null;
  
  // Get current time for displaying in the helper text
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  const isToday = selectedDate.toDateString() === now.toDateString();
  
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
        
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <input 
              type="date" 
              className="w-full p-2 border border-gray-300 rounded-[12px] cursor-pointer"
              value={getFormattedDate(selectedDate)}
              min={getFormattedDate(new Date())}
              max={getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 2)))}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Time</label>
            <input 
              type="time" 
              className="w-full p-2 border border-gray-300 rounded-[12px] cursor-pointer"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            {scheduleError && (
              <p className="text-red-500 text-xs mt-1">{scheduleError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Restaurant hours: {outletDetails?.outdetails?.Timing?.Today?.openTime?.slice(0, 5) || '08:00'} - {outletDetails?.outdetails?.Timing?.Today?.closeTime?.slice(0, 5) || '23:00'}
            </p>
            {isToday && (
              <p className="text-xs text-gray-500 mt-1">
                Current time is {currentTime}. Please select a future time.
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleConfirmSchedule}
            className="w-full py-3 bg-[#FF583A] text-white rounded-[12px] font-medium active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal; 