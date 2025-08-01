import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageModal from '../../components/MessageModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ScheduleOrder = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({ hour: '08', minute: '15', period: 'AM' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedButton, setSelectedButton] = useState('today');

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const handleDateChange = (date) => {
    try {
      setSelectedDate(date);
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error changing date:', error);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSchedule = () => {
    try {
      const formattedTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
      const formattedDate = formatDate(selectedDate);
      
      console.log('Scheduled Order Details:', {
        date: formattedDate,
        time: formattedTime,
        rawDate: selectedDate,
        rawTime: selectedTime
      });

      setShowSuccessModal(true);

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error scheduling order:', error);
    }
  };

  const handleTodayClick = () => {
    try {
      setSelectedDate(new Date());
      setShowDatePicker(false);
      setSelectedButton('today');
    } catch (error) {
      console.error('Error setting today\'s date:', error);
    }
  };

  const handleTomorrowClick = () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      setShowDatePicker(false);
      setSelectedButton('tomorrow');
    } catch (error) {
      console.error('Error setting tomorrow\'s date:', error);
    }
  };

  const handleOvermorrowClick = () => {
    try {
      const overmorrow = new Date();
      overmorrow.setDate(overmorrow.getDate() + 2);
      setSelectedDate(overmorrow);
      setShowDatePicker(false);
      setSelectedButton('overmorrow');
    } catch (error) {
      console.error('Error setting overmorrow\'s date:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 flex items-center">
        <button 
          onClick={() => navigate('/cart')}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowBackIcon />
        </button>
        <h1 className="text-xl font-semibold ml-4">Schedule Order</h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleTodayClick}
              className={`flex-1 py-2 px-2 rounded-lg transition-colors font-medium text-sm
                ${selectedButton === 'today' 
                  ? 'bg-[#5046E5] text-white border-2 border-[#5046E5]' 
                  : 'bg-[#EEEDFD] text-[#5046E5] hover:bg-[#5046E5] hover:text-white'}`}
            >
              Today
            </button>
            <button
              onClick={handleTomorrowClick}
              className={`flex-1 py-2 px-2 rounded-lg transition-colors font-medium text-sm
                ${selectedButton === 'tomorrow' 
                  ? 'bg-[#5046E5] text-white border-2 border-[#5046E5]' 
                  : 'bg-[#EEEDFD] text-[#5046E5] hover:bg-[#5046E5] hover:text-white'}`}
            >
              Tomorrow
            </button>
            <button
              onClick={handleOvermorrowClick}
              className={`flex-1 py-2 px-2 rounded-lg transition-colors font-medium text-sm
                ${selectedButton === 'overmorrow' 
                  ? 'bg-[#5046E5] text-white border-2 border-[#5046E5]' 
                  : 'bg-[#EEEDFD] text-[#5046E5] hover:bg-[#5046E5] hover:text-white'}`}
            >
              Overmorrow
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Selected Date</label>
              <span className="text-[#5046E5] font-medium">{formatDate(selectedDate)}</span>
            </div>
            <button 
              onClick={() => setShowDatePicker(true)}
              className="text-[#5046E5] text-sm font-medium hover:bg-[#EEEDFD] px-3 py-1 rounded-md transition-colors"
            >
              Change Date
            </button>
          </div>
          
          {showDatePicker && (
            <div className="mt-4">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                inline
                calendarClassName="!border-0 !shadow-none"
                wrapperClassName="!bg-white"
                dayClassName={date => 
                  date.getDate() === selectedDate.getDate() 
                    ? "!bg-[#5046E5] !text-white !rounded-full"
                    : "hover:!bg-[#EEEDFD] !rounded-full"
                }
                monthClassName={() => "!font-medium !text-gray-600"}
                weekDayClassName={() => "!text-gray-400 !font-normal"}
                fixedHeight
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="text-center mb-8">
            <label className="block text-sm text-gray-600 mb-2">Selected Time</label>
            <div className="text-4xl font-light text-gray-700">
              {`${selectedTime.hour}:${selectedTime.minute}`}
              <span className="text-sm ml-1">{selectedTime.period}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600 mb-1">Period</label>
              <button 
                className={`w-16 py-2 rounded-lg transition-all ${selectedTime.period === 'AM' ? 'text-[#5046E5] bg-[#EEEDFD] font-medium' : 'text-gray-400 hover:bg-gray-100'}`}
                onClick={() => setSelectedTime(prev => ({ ...prev, period: 'AM' }))}
              >
                AM
              </button>
              <button 
                className={`w-16 py-2 rounded-lg transition-all ${selectedTime.period === 'PM' ? 'text-[#5046E5] bg-[#EEEDFD] font-medium' : 'text-gray-400 hover:bg-gray-100'}`}
                onClick={() => setSelectedTime(prev => ({ ...prev, period: 'PM' }))}
              >
                PM
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600 mb-1">Hour</label>
              <div className="h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    className={`w-16 py-2 rounded-lg mb-1 transition-all ${selectedTime.hour === hour ? 'text-[#5046E5] bg-[#EEEDFD] font-medium' : 'text-gray-400 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTime(prev => ({ ...prev, hour }))}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600 mb-1">Minute</label>
              <div className="h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    className={`w-16 py-2 rounded-lg mb-1 transition-all ${selectedTime.minute === minute ? 'text-[#5046E5] bg-[#EEEDFD] font-medium' : 'text-gray-400 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTime(prev => ({ ...prev, minute }))}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSchedule}
            className="w-full py-3 bg-[#5046E5] text-white rounded-lg hover:bg-[#4038c7] transition-colors"
          >
            Schedule Order
          </button>
        </div>
      </div>

      <MessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Order Scheduled"
        message={`Your order has been scheduled for ${formatDate(selectedDate)} at ${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`}
        icon={CheckCircleIcon}
        iconColor="#5046E5"
        iconBgColor="#EEEDFD"
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default ScheduleOrder;
