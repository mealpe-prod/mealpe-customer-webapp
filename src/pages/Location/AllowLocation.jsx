import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import MapImage from "../../assets/Map.png";
import Toast from "../../components/Toast";
import { setUser } from "../../redux/slices/authSlice";
import Loader from "../../components/Loader";
import { MapPin,Loader2 } from "lucide-react";

const AllowLocation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.user);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google Maps API Key - should be stored in environment variables in a real application
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Request location permission using browser's Geolocation API
  const requestLocationPermission = async () => {
    if (navigator.geolocation) {
      return "granted";
    } else {
      // Geolocation not supported by this browser
      Toast.error("Geolocation is not supported by this browser.");
      return "denied";
    }
  };

  // Extract city name from Google Maps geocoding API response
  const getCity = (data) => {
    try {
      const addressComponents = data.results[0].address_components;
      const city = addressComponents.find((component) =>
        component.types.includes("locality")
      );
      console.log("City:", city.long_name);
      return city.long_name;
    } catch (error) {
      console.error("Error extracting city name:", error);
      Toast.error("Could not determine your city. Please select manually.");
      return null;
    }
  };

  // Auto select campus and store data
  const selectCampusAndNavigate = async (cityId, campusData) => {
    try {
      // Store city data
      const cityData = {
        cityId: cityId,
        city: campusData[0]?.campusName?.split(",")[1]?.trim() || "",
        state: "",
        cityImage: "",
        latitude: "",
        longitude: "",
      };
      localStorage.setItem("cityData", JSON.stringify(cityData));

      // Select the first campus (default)
      const campus = campusData[0];

      // Store required campus fields
      const campusInfo = {
        campusId: campus.campusId,
        address: campus.address,
        campusName: campus.campusName,
        isActive: true,
        organizationId: "",
        tag: "",
      };
      localStorage.setItem("campusData", JSON.stringify(campusInfo));

      // Update user profile with new campus if user is logged in
      if (userData?.customerAuthUID) {
        try {
          const updateData = {
            customerName: userData.customerName,
            email: userData.email,
            mobile: userData.mobile,
            dob: userData.dob,
            genderId: userData.genderId,
            campusId: campus.campusId,
          };

          const response = await axios.post(
            `${
              import.meta.env.VITE_APP_BACKEND_BASE_URL
            }customer/updateCustomer/${userData.customerAuthUID}`,
            updateData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            // Update Redux store with new data
            dispatch(
              setUser({
                ...userData,
                ...response.data.data,
              })
            );
          } else {
            console.error("Failed to update user campus");
          }
        } catch (error) {
          console.error("Error updating user campus:", error);
        }
      }

      // Navigate to home
      navigate("/home");
    } catch (error) {
      console.error("Error selecting campus:", error);
      Toast.error(
        "Could not automatically select campus. Please try manual selection."
      );
      navigate("/select-city");
    }
  };

  // Get user's current location
  const getLocation = async () => {
    const result = await requestLocationPermission();

    setIsLoading(true);
    if (result === "granted") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log({ position });

          // Get address details from coordinates using Google Maps Geocoding API
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${GOOGLE_MAPS_KEY}`
            )
            .then((res) => {
              console.log("geocode data", res.data);
              const cityName = getCity(res.data);

              if (cityName) {
                console.log({ cityName });

                // Fetch campus locations by city name
                const organizationCode =
                  localStorage.getItem("organizationCode");
                const url = `${
                  import.meta.env.VITE_APP_BACKEND_BASE_URL
                }campus/getCampusLocations/${cityName}${
                  organizationCode
                    ? `?organizationCode=${organizationCode}`
                    : ""
                }`;

                axios
                  .get(url)
                  .then((campusRes) => {
                    console.log("Campus data:", campusRes.data);

                    if (
                      campusRes.data.success &&
                      campusRes.data.data.length > 0
                    ) {
                      // Filter campuses to only include those with latitude and longitude
                      const validCampuses = campusRes.data.data.filter(
                        (campus) => campus.latitude && campus.longitude
                      );

                      if (validCampuses.length > 0) {
                        // Auto select campus and navigate to home
                        selectCampusAndNavigate(
                          campusRes.data.cityId,
                          validCampuses
                        );
                      } else {
                        Toast.error(
                          `No campuses with location data found in ${cityName}. Please select manually.`
                        );
                        navigate("/select-city");
                      }
                    } else {
                      Toast.error(
                        `No campuses found in ${cityName}. Please select manually.`
                      );
                      navigate("/select-city");
                    }
                  })
                  .catch((err) => {
                    console.error("Error fetching campus locations:", err);
                    Toast.error(
                      "Could not find campuses in your area. Please select manually."
                    );
                    navigate("/select-city");
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              } else {
                setIsLoading(false);
                navigate("/select-city");
              }
            })
            .catch((err) => {
              console.error("Error getting city from coordinates:", err);
              setIsLoading(false);

              if (typeof err?.message === "string") {
                Toast.error(err?.message);
              } else if (
                typeof err?.response?.data?.error?.message === "string"
              ) {
                Toast.error(err?.response?.data?.error?.message);
              } else if (typeof err?.response?.data?.message === "string") {
                Toast.error(err?.response?.data?.message);
              } else {
                Toast.error("Something Went Wrong");
              }

              navigate("/select-city");
            });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation(null);
          setErrorMsg(error.message);
          setIsLoading(false);
          Toast.error("Error getting your location: " + error.message);
          navigate("/select-city");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 60000 // 1 minute
        }
      );
    } else {
      Toast.error("No permission to access location");
      setIsLoading(false);
      navigate("/select-city");
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 py-8 bg-white">
      <div className="max-w-md w-full mx-auto text-center md:text-left md:pr-8 md:w-1/2">
        <h1 className="text-2xl md:text-4xl font-bold mb-3 text-gray-800 transition-all">
          Share Your Address With Us
        </h1>

        <p className="text-gray-600 mb-8 text-base md:text-lg">
          Please enter your location or allow access to your location to find
          food near you
        </p>
        
        {/* Desktop image */}
        <div className="hidden md:block md:mt-6">
          <img
            src={MapImage}
            alt="Location Map"
            className="h-96 w-96 object-contain mx-auto md:mx-0 drop-shadow-md hover:scale-105 transition-all duration-300"
          />
        </div>

        {/* Mobile image */}
        <div className="md:hidden flex justify-center items-center mb-12 mt-6">
          <img
            src={MapImage}
            alt="Location Map"
            className="h-64 w-64 object-contain drop-shadow-md"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 md:mt-8 w-full max-w-xs md:max-w-sm">
        <button
          onClick={getLocation}
          className="w-full bg-[#FF583A] cursor-pointer text-white py-2.5 px-6 rounded-[12px] font-medium hover:bg-[#e64a2e] transition-all active:scale-95 duration-300 shadow-md hover:shadow-lg text-md flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Allow Location
        </button>

        <button
          onClick={() => navigate("/select-city")}
          className="w-full bg-white text-[#FF583A] cursor-pointer border border-[#FF583A] py-2.5 px-6 rounded-[12px] font-medium hover:bg-[#FFF1EE] transition-all active:scale-95 duration-300 shadow-sm hover:shadow-md text-md"
          disabled={isLoading}
        >
          Select Manually
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 ease-out">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl blur-sm opacity-20 animate-pulse"></div>
        
        <div className="relative bg-white rounded-2xl p-8 text-center">
          {/* Location icon with animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Ripple effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-ping opacity-30 animation-delay-75"></div>
              
              <MapPin className="w-8 h-8 text-red-600 relative z-10" />
            </div>
            
            {/* Floating dots animation */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-bounce animation-delay-300"></div>
            <div className="absolute top-4 -right-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce animation-delay-500"></div>
          </div>

          {/* Main heading */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Finding Your Perfect Campus
          </h3>
          
          {/* Subtext */}
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            We're scanning nearby locations to bring you the best campus options tailored just for you
          </p>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-1 mb-3">
              <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              <span className="text-sm font-medium text-gray-600">Searching...</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full animate-pulse transform origin-left">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Status steps */}
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Location detected</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
              <span>Analyzing nearby campuses</span>
            </div>
            <div className="flex items-center justify-center space-x-2 opacity-50">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span>Preparing results</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-75 {
          animation-delay: 75ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
      )}
    </div>
  );
};

export default AllowLocation;
