import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginSuccess, logout } from '../../redux/slices/authSlice';
import StartLogo from '../../assets/startLogo.png';
import onboarding3 from '../../assets/onboarding3.png';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import { setUser } from '../../redux/slices/authSlice';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const { customerAuthUID, customerName, mobile, email, organizationCode } = location.state || {};

  useEffect(() => {
    if (!mobile) {
      navigate('/login');
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [mobile, navigate]);

  const handleChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Enhanced auto-submit when the last digit is entered
    if (value && index === 5) {
      // Create a new array with the updated value to ensure we're checking the latest state
      const completeOtp = [...newOtp];
      
      // Check if all digits are filled
      const isComplete = completeOtp.every(digit => digit !== '');
      
      if (isComplete) {
        // Visual feedback before submission
        inputRefs.current[index].blur(); // Remove focus to hide keyboard
        
        // Show loading state immediately for better UX
        setIsLoading(true);
        
        // Small timeout to ensure state is updated before submission
        setTimeout(() => {
          const finalOtp = completeOtp.join('');
          if (finalOtp.length === 6) {
            handleSubmit(null, finalOtp);
          }
        }, 100);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/sendMobileOTP`, {
        mobile: Number(`91${mobile}`),
        name: customerName
      });
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e, providedOtp = null) => {
    if (e) {
      e.preventDefault();
    }
    
    const otpString = providedOtp || otp.join('');
    // console.log("otpString ", otpString);
    
    // Check if any digit is empty
    if (providedOtp ? providedOtp.length !== 6 : otp.some(digit => digit === '')) {
      setError('Please enter complete OTP');
      setIsLoading(false);
      return;
    }

    // Check if OTP length is exactly 6
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    // Only set loading if not already set (from auto-submit)
    if (!isLoading) {
      setIsLoading(true);
    }
    setError('');

    try {
      // First verify the OTP
      const verifyOTPResponse = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/verifyMobileOTP`, {
        mobile: Number(`91${mobile}`),
        otp: otpString
      });

      // console.log("verifyOTPResponse", verifyOTPResponse)

      if (!verifyOTPResponse.data.success) {
        throw new Error(verifyOTPResponse.data.message || 'OTP verification failed');
      }
      
      // After OTP verification, call the login API
      const loginResponse = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/userLogin`, {
        mobile: mobile,
        organizationCode: location.state.organizationCode
      });

      if (loginResponse.status === 200) {
        
        dispatch(setUser(loginResponse.data.data));
        const campusData = {
          campusId: loginResponse?.data?.data?.campusId?.campusId,
          address: loginResponse?.data?.data?.campusId?.address,
          campusName: loginResponse?.data?.data?.campusId?.campusName,
          tag: loginResponse?.data?.data?.campusId?.tag,
          isActive: loginResponse?.data?.data?.campusId?.isActive,
          organizationId: loginResponse?.data?.data?.campusId?.organizationId
        };

        const cityData = {
          cityId: loginResponse?.data?.data?.campusId?.cityId?.cityId,
          city: loginResponse?.data?.data?.campusId?.cityId?.city,
          state: loginResponse?.data?.data?.campusId?.cityId?.state,
          cityImage: loginResponse?.data?.data?.campusId?.cityId?.cityImage,
          latitude: loginResponse?.data?.data?.campusId?.cityId?.latitude,
          longitude: loginResponse?.data?.data?.campusId?.cityId?.longitude,
        };

        localStorage.setItem('campusData', JSON.stringify(campusData));
        localStorage.setItem('cityData', JSON.stringify(cityData));
        localStorage.setItem('organizationCode', organizationCode);
        
        // Redirect to allow-location page instead of home or select-city
        navigate('/allow-location');
        Toast.success('Login successful');
      }

    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.error?.message || error.message || 'Verification failed. Please try again.');
      Toast.error(error.response?.data?.error?.message || error.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs on failure
      // Focus on first input for better UX
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
      
    }
  };

  const handleChangeNumber = () => {
    // Clear auth state
    dispatch(logout());
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('campusData');
    localStorage.removeItem('cityData');
    

    // Navigate back to login
    navigate('/login');
  };

  return (
    <div className="h-[100dvh] flex">
      {/* Left Section - Image (visible only on desktop) */}
      <div className="hidden lg:block lg:w-1/2">
        <div 
          className="fixed left-0 top-0 w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${onboarding3})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <img src={StartLogo} alt="Mealpe" className="h-16" />
          </div>
        </div>
      </div>

      {/* Right Section - OTP Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col">
        {/* Mobile Header (visible only on mobile) */}
        <div className="relative w-full h-[30vh] bg-cover bg-center lg:hidden"
          style={{
            backgroundImage: `url(${onboarding3})`
          }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-4 left-4">
            <button onClick={() => navigate('/login')} className="text-white p-2 rounded-full bg-white/20 active:scale-95 transition-transform duration-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={StartLogo} alt="Mealpe" className="h-12" />
          </div>
        </div>

        {/* OTP Form Container */}
        <div className="px-6 lg:px-14 xl:px-14 pt-8 bg-white lg:rounded-none rounded-t-[16px] -mt-6 relative z-10 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:min-h-screen">
          {/* Back button for desktop */}
          <button onClick={() => navigate('/login')} className="hidden cursor-pointer lg:flex items-center text-gray-600 mb-6 hover:text-[#FF583A] active:scale-95 transition-transform duration-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="ml-2">Back</span>
          </button>

          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-[#FF583A]">OTP Verification</h1>
            <p className="text-gray-500 mb-6">
              OTP has been sent to +91 {String(mobile).slice(0, 2)}***{String(mobile).slice(-5)}
              <button 
                onClick={handleChangeNumber}
                className="text-[#4D81E7] ml-2 font-medium hover:underline active:scale-95 transition-transform duration-200"
              >
                Change Number?
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-between space-x-1.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                        if (index === 0 && otp.every(d => d === '')) {
                          setTimeout(() => el?.focus(), 100);
                        }
                      }}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-[12px] text-center text-xl font-normal border border-gray-300 focus:ring-0 focus:ring-[#FF583A] focus:border-[#FF583A] focus:outline-none transition-all duration-200"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-[#FF583A] text-sm text-center py-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Resend OTP in{' '}
                  <span className="text-[#FF583A] font-medium">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full h-[48px] bg-[#FF5B37] text-white rounded-[12px] cursor-pointer border border-[#FF5B37] px-6 py-2.5 gap-[10px] font-medium hover:bg-[#ff4520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform duration-200"
              >
                {isLoading ? <Loader /> : 'Continue'}
              </button>

              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="w-full text-[#FF583A] text-sm font-medium hover:underline active:scale-95 transition-transform duration-200"
                >
                  Resend OTP
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification; 
