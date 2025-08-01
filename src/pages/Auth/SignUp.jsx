import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import StartLogo from '../../assets/startLogo.png';
import onboarding1 from '../../assets/onboarding1.png';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrgCode, setShowOrgCode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    organizationCode: '',
    phoneNumber: '',
    email: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    agreeToTerms: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phoneNumber') {
      // Only allow numbers and limit to 10 digits
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    // Phone Number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please agree to the Terms & Privacy Policy';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/signup`, {
        name: formData.fullName,
        mobile: formData.phoneNumber,
        email: formData.email,
        organizationCode: formData.organizationCode
      });

      console.log("sign in response", response)

      if (!response.data.success) {
        Toast.error(response.data.message);
        return;
      }

      Toast.success("OTP sent successfully");
      navigate('/otp-verification', {
        state: {
          customerAuthUID: response.data.data.customerAuthUID,
          customerName: formData.fullName,
          mobile: formData.phoneNumber,
          email: formData.email,
          organizationCode: formData.organizationCode
        }
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.phoneNumber.length === 10 &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.agreeToTerms
    );
  };

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

      {/* Right Section - Sign Up Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col">
        {/* Mobile Header (visible only on mobile) */}
        <div className="relative w-full h-[30vh] bg-cover bg-center lg:hidden"
          style={{
            backgroundImage: `url(${onboarding1})`
          }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-4 left-4">
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

        {/* Sign Up Form Container */}
        <div className="px-6 pt-8 bg-white lg:rounded-none lg:px-8 rounded-t-[16px] -mt-6 relative z-10 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:min-h-screen">
          {/* Back button for desktop */}
          <button onClick={() => navigate(-1)} className="hidden cursor-pointer lg:flex items-center text-gray-600 mb-6 hover:text-[#FF583A] active:scale-95 transition-transform duration-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="ml-2">Back</span>
          </button>

          <div className="max-w-md mx-auto w-full mb-10">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-[#FF583A]">Sign up</h1>
            <p className="text-gray-500 mb-2 text-sm">Create an account or log in to explore our app</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className='flex flex-col lg:flex-row md:flex-row gap-4'>
                {/* Full Name Input */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-[12px] focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Organization Code Input */}
                <div>
                { !showOrgCode &&
                  <button
                  type="button"
                  onClick={() => setShowOrgCode(prev => !prev)}
                  className="text-sm text-gray-600 transition-colors duration-200 md:mt-11 lg:mt-11 xl:mt-11"
                >
                  Have an organization code? <span className="text-[#FF583A] hover:underline cursor-pointer active:scale-95 transition-transform duration-200">Click here</span>
                </button>
                }
                {showOrgCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization code (Optional)
                    </label>
                    <input
                      type="text"
                      name="organizationCode"
                      value={formData.organizationCode}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-[12px] px-3 py-2 focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200"
                      placeholder="i.e. (OC2001)"
                    />
                  </div>
                )}
              </div>

              </div>

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
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`flex-1 block w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-r-[12px] px-3 py-2 focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-[12px] focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A] transition-all duration-200`}
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Terms & Privacy Policy Checkbox */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 text-[#FF583A] focus:ring-[#FF583A] border-gray-300 cursor-pointer rounded-[12px] ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                    I agree to the{' '}
                    <button type="button" onClick={() => window.open('https://zyxwtaeuvipslarwyrbe.supabase.co/storage/v1/object/public/documents/policy-files/MealPe_Privacy%20Policy_AGC_Sept%2005,%202023.pdf', '_blank')} className="text-[#FF583A] hover:underline cursor-pointer">Terms</button>
                    {' & '}
                    <button type="button" onClick={() => window.open('https://zyxwtaeuvipslarwyrbe.supabase.co/storage/v1/object/public/documents/policy-files/MealPe_Privacy%20Policy_AGC_Sept%2005,%202023.pdf', '_blank')} className="text-[#FF583A] hover:underline cursor-pointer">Privacy Policy</button>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* General Error Display */}
              {errors.submit && (
                <p className="text-[#FF583A] text-sm text-center bg-[#FF583A]/10 py-2 rounded-md">
                  {errors.submit}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="w-full h-[48px] bg-[#FF5B37] text-white rounded-[12px] cursor-pointer border border-[#FF5B37] px-6 py-2.5 gap-[10px] font-medium hover:bg-[#ff4520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform duration-200"
              >
                {isLoading ? <Loader /> : 'Continue'}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#4D81E7] font-medium hover:underline active:scale-95 transition-transform duration-200 cursor-pointer"
                  >
                    Log in
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

export default SignUp;
