import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Onboarding1 from '../assets/onboarding1.png';
import Onboarding2 from '../assets/onboarding2.png';
import Onboarding3 from '../assets/onboarding3.png';
import Logo from "../assets/startLogo.png"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const onboardingData = [
  {
    image: Onboarding1,
    title: "Welcome To",
    titleColored: "MealPe",
    titleEnd: "Food Court",
    description: "Explore a variety of delicious meals available from multiple food outlets in one convenient platform"
  },
  {
    image: Onboarding2,
    title: "Customize and",
    titleColored: "Schedule",
    titleEnd: "Your Orders",
    description: "Personalize your meal and set a delivery time that fits perfectly into your daily schedule"
  },
  {
    image: Onboarding3,
    title: "Effortless Ordering",
    titleColored: "Delightful",
    titleEnd: "Experience",
    description: "Your meal will be delivered to your preferred location—fresh, on time, and ready to enjoy!"
  }
];

const SplashScreen = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('user'); // or however you store your auth token
    if (isLoggedIn) {
      navigate('/home');
    }
  }, [navigate]);

  const handleNavigation = () => {
    if (currentScreen < onboardingData.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-white overflow-hidden">
      {/* Desktop Background with Side Image */}
      <div className="hidden lg:block fixed inset-0 bg-gradient-to-r from-[#5046E5]/10 to-white z-0">
        <div className="absolute left-0 top-0 w-1/2 h-full">
          <img 
            src={onboardingData[currentScreen].image} 
            alt="Onboarding" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>

      {/* Container with max-width for mobile and responsive layout for desktop */}
      <div className="relative w-full h-full max-w-[450px] mx-auto lg:max-w-none lg:w-full lg:flex lg:items-center lg:justify-center">
        {/* Mobile Background Image - hidden on desktop */}
        <div 
          className="absolute inset-0 w-full h-full z-0 lg:hidden"
          style={{
            backgroundImage: `url(${onboardingData[currentScreen].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full lg:flex-row lg:max-w-7xl lg:mx-auto">
          {/* Logo - Mobile Only */}
          <div className="w-full h-[100vh] flex items-center justify-center pt-12 lg:hidden">
            <img src={Logo} alt="MealPe Logo" className="w-[200px] h-auto" />
          </div>

          {/* Desktop Left Side - Logo only (hidden on mobile) */}
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:w-1/2 lg:h-full lg:pl-12">
            <img src={Logo} alt="MealPe Logo" className="w-[200px] h-auto mb-8" />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2 bg-white w-full rounded-t-[30px] py-8 px-4 mt-auto lg:mt-0 lg:w-1/2 lg:h-full lg:flex lg:flex-col lg:justify-center lg:rounded-none lg:px-12 lg:items-start lg:text-left">
            <h1 className="text-2xl font-medium text-black m-0 lg:text-4xl">{onboardingData[currentScreen].title}</h1>
            <div className="flex items-center justify-center lg:justify-start">
              <span className="text-2xl font-bold text-[#FF583A] lg:text-4xl">{onboardingData[currentScreen].titleColored} &nbsp;</span>
              <span className="text-2xl font-medium text-black lg:text-4xl">{onboardingData[currentScreen].titleEnd}</span>
            </div>
            <p className="text-sm text-gray-600 max-w-[300px] mx-auto lg:mx-0 lg:max-w-md lg:text-lg lg:mt-4">
              {onboardingData[currentScreen].description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between w-4/5 max-w-[400px] mx-auto mt-6 lg:mx-0 lg:mt-12">
              <button 
                className="px-3 py-2 text-gray-600 hover:text-[#FF583A] transition-colors cursor-pointer"
                onClick={handleSkip}
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                {onboardingData.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentScreen ? 'bg-[#FF583A] w-4' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button 
                className="w-[50px] h-[50px] rounded-full bg-[#FF583A] hover:bg-[#FF583A] text-white flex items-center justify-center text-2xl transition-colors cursor-pointer lg:w-[60px] lg:h-[60px]"
                onClick={handleNavigation}
              >
                <ArrowForwardIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 