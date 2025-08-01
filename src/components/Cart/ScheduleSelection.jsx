import React, { useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ScheduleSelection = ({ scheduleType, setScheduleType, handleScheduleLater, getFormattedScheduleTime, outletDetails }) => {
  const isMess = outletDetails?.outdetails?.hasMess;
  const isOutletOpen = outletDetails?.outdetails?.isOutletOpen || false;
  
  // Check if current time is within outlet hours
  const isWithinOutletHours = () => {
    if (!outletDetails?.outdetails?.Timing?.Today) return false;
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;
    
    const openTime = outletDetails?.outdetails?.Timing?.Today?.openTime;
    const closeTime = outletDetails?.outdetails?.Timing?.Today?.closeTime;
    
    if (!openTime || !closeTime) return false;
    
    const [openHours, openMinutes] = openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
    
    const openTimeInMinutes = openHours * 60 + openMinutes;
    const closeTimeInMinutes = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
  };
  
  // Format outlet opening hours for display
  const getOutletHours = () => {
    const openTime = outletDetails?.outdetails?.Timing?.Today?.openTime || '';
    const closeTime = outletDetails?.outdetails?.Timing?.Today?.closeTime || '';
    
    if (!openTime || !closeTime) return '';
    
    return `${openTime.slice(0, 5)} - ${closeTime.slice(0, 5)}`;
  };
  
  // Show "Schedule now" only if outlet is open and within operating hours
  const canScheduleNow = isOutletOpen && isWithinOutletHours() && !isMess;

  // Only set scheduleType to 'now' on initial render if it can be scheduled now and no selection has been made yet
  useEffect(() => {
    // Only set scheduleType to 'now' if no selection has been made yet (scheduleType is null or undefined)
    if (canScheduleNow && !scheduleType) {
      setScheduleType('now');
    }
  }, [canScheduleNow, scheduleType, setScheduleType]);
  
  // Get reason why scheduling now isn't available
  const getUnavailableReason = () => {
    if (isMess) return "Mess orders can only be scheduled in advance";
    if (!isOutletOpen) return "Outlet is currently closed";
    if (!isWithinOutletHours()) return `Outlet hours today: ${getOutletHours()}`;
    return "";
  };

  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <p className="text-sm mb-3">Select Schedule Type :</p>
      <div className="flex gap-2">
        {canScheduleNow && (
          <button 
            className={`py-2 px-3 border rounded-[12px] text-sm flex items-center active:scale-95 transition-all duration-300 cursor-pointer ${
              scheduleType === 'now' 
                ? 'border-[#FF583A] bg-[#FFF1EE] text-[#FF583A]' 
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => setScheduleType('now')}
          >
            {scheduleType === 'now' && (
              <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">⬤</span>
            )}
            <span className={scheduleType !== 'now' ? 'ml-5' : ''}>Schedule now</span>
          </button>
        )}
        <button 
          className={`py-2 px-3 border rounded-[12px] text-sm flex items-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer ${
            scheduleType === 'later' 
              ? 'border-[#FF583A] bg-[#FFF1EE] text-[#FF583A]' 
              : 'border-gray-300 bg-white'
          }`}
          onClick={handleScheduleLater}
        >
          {scheduleType === 'later' && (
            <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">⬤</span>
          )}
          <span className={scheduleType !== 'later' ? 'ml-5' : ''}>{isMess ? 'Select schedule date' : 'Schedule later'}</span>
          <CalendarTodayIcon fontSize="small" />
        </button>
      </div>
      
      {!canScheduleNow && (
        <div className="flex items-center text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
          <InfoOutlinedIcon fontSize="small" className="mr-1" />
          {getUnavailableReason()}
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-2">
        {getFormattedScheduleTime()}
      </div>
    </div>
  );
};

export default ScheduleSelection; 