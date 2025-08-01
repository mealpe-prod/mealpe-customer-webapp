import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, setUser } from '../../redux/slices/authSlice';
import CustomInput from '../../components/CustomInput';
import Loader from '../../components/Loader';
import StartLogo from '../../assets/startLogo.png';
import onboarding1 from '../../assets/onboarding1.png';
import GoogleIcon from '../../assets/google.png';
import axios from 'axios';
import Toast from '../../components/Toast';
import GoogleLoginButton from './GoogleLoginButton';

const Login = () => {
  const [credentials, setCredentials] = useState({ phoneNumber: '', organizationCode: '' });
  const [errors, setErrors] = useState({ phoneNumber: '', organizationCode: '' });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showOrgCode, setShowOrgCode] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/allow-location');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone number input to allow only numbers
    if (name === 'phoneNumber') {
      // Remove any non-digit characters and limit to 10 digits
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
      setCredentials(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setCredentials(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { phoneNumber: '', organizationCode: '' };

    // Phone number validation
    if (!credentials.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d+$/.test(credentials.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must contain only digits';
      isValid = false;
    } else if (credentials.phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
      isValid = false;
    }

    // Organization code validation
    // if (!credentials.organizationCode.trim()) {
    //   newErrors.organizationCode = 'Organization code is required';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsButtonLoading(true);
    
    try {
      // First API call to send OTP
      const sendOTPResponse = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/sendMobileOTP`, {
        mobile: Number(`91${credentials.phoneNumber}`),
        name: "" // Name will be fetched after login
      });

      // console.log(sendOTPResponse);

      if (sendOTPResponse.status === 200) {
        // Navigate to OTP screen with necessary data
        Toast.success('OTP sent successfully');
        navigate('/otp-verification', {
          state: {
            mobile: credentials.phoneNumber,
            organizationCode: credentials.organizationCode
          }
        });
      }

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: error.response?.data?.message || 'Failed to send OTP'
      }));
      console.error('Failed to send OTP:', error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const isFormValid = 
    credentials.phoneNumber.trim() !== '' && 
    credentials.phoneNumber.length === 10 && 
    /^\d+$/.test(credentials.phoneNumber) 

  return (
    <div className="h-[100dvh] flex">
      {/* Left Section - Image (visible only on desktop) */}
      <div className="hidden lg:block lg:w-1/2">
        <div 
          className="fixed left-0 top-0 w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${onboarding1})`,
          }}
        >
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <img src={StartLogo} alt="Mealpe" className="h-16" />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col">
        {/* Mobile Header (visible only on mobile) */}
        <div className="relative w-full h-[30vh] bg-cover bg-center lg:hidden"
          style={{
            backgroundImage: `url(${onboarding1})`
          }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-4 left-4 active:scale-95 transition-transform duration-200">
            <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full bg-white/20 active:scale-95 transition-transform duration-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={StartLogo} alt="Mealpe" className="h-12" />
          </div>
        </div>

        {/* Login Form Container */}
        <div className="px-6 lg:px-14 xl:px-14 pt-8 bg-white lg:rounded-none rounded-t-[16px] -mt-6 relative z-10 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:min-h-screen">
          {/* Back button for desktop */}
          <button onClick={() => navigate(-1)} className="hidden cursor-pointer lg:flex items-center text-gray-600 mb-6 hover:text-[#FF583A] active:scale-95 transition-transform duration-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="ml-2">Back</span>
          </button>

          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-[#FF583A]">Log in</h1>
            <p className="text-gray-500 mb-2 text-sm">This won't take long!</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-[12px]">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={credentials.phoneNumber}
                    onChange={handleChange}
                    className="flex-1 block w-full border border-gray-300 rounded-r-[12px] px-3 py-2 focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200"
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-[#FF583A] text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Organization Code Input */}
              <div>
                { !showOrgCode &&
                  <button
                  type="button"
                  onClick={() => setShowOrgCode(prev => !prev)}
                  className="text-sm text-gray-600 transition-colors duration-200"
                >
                  Have an organization code? <span className="text-[#FF583A] hover:underline cursor-pointer active:scale-95 transition-transform duration-200">Click here</span>
                </button>
                }
                {showOrgCode && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization code (Optional)
                    </label>
                    <input
                      type="text"
                      name="organizationCode"
                      value={credentials.organizationCode}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-[12px] px-3 py-2 focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200"
                      placeholder="i.e. (OC2001)"
                    />
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!isFormValid || isButtonLoading}
                className="w-full h-[48px] bg-[#FF5B37] text-white rounded-[12px] cursor-pointer border border-[#FF5B37] px-6 py-2.5 gap-[10px] font-medium hover:bg-[#ff4520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform duration-200"
              >
                {isButtonLoading ? <Loader /> : 'Continue'}
              </button>

              {/* Social Login Options */}
              <div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

              <GoogleLoginButton/>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-[#4D81E7] font-medium hover:text-[#4D81E7] active:scale-95 transition-transform duration-200 cursor-pointer hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 