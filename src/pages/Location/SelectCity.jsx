import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import {SkeletonLoader} from '../../components/SkeletonLoader';

const SelectCity = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();

    const cityId = JSON.parse(localStorage.getItem("cityData"));
    if (cityId) {
      setSelectedCityId(cityId.cityId);
    }
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      const filtered = cities.filter(city => 
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) && city.Campus && city.Campus.length > 0
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, cities]);

  const fetchCities = async () => {
    const organizationCode = localStorage.getItem('organizationCode');
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}city/getCities?${organizationCode ? `organizationCode=${organizationCode}` : ''}`);
      if (response.data.success) {
        setCities(response.data.data);
        setFilteredCities(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch cities');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (cityId) => {
    // Find the selected city object and store required fields
    const selectedCity = cities.find(city => city.cityId === cityId);
    const cityData = {
      cityId: selectedCity.cityId,
      city: selectedCity.city,
      state: selectedCity.state,
      cityImage: selectedCity.cityImage,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude
    };
    localStorage.setItem('cityData', JSON.stringify(cityData));
    navigate(`/select-campus/${cityId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#FF583A] text-white p-4">
          <div className="flex items-center">
            <button onClick={handleBack} className="p-1 active:scale-95 transition-transform duration-200">
              <ArrowBackIcon className="active:scale-95 transition-transform duration-200" />
            </button>
            <h1 className="text-xl font-medium ml-2">Select City</h1>
          </div>
          <p className="text-sm mt-1 ml-1">Please Select your City from below or allow access to your location to detect automatically</p>
          
          <div className="mt-4 relative active:scale-95 transition-transform duration-200">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              disabled
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none"
            />
          </div>
        </div>
        <div className="p-4">
          <SkeletonLoader type="city" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchCities}
            className="px-4 py-2 bg-[#FF583A] text-white rounded-lg hover:bg-[#ff4520] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FF583A] text-white p-4 rounded-b-[12px]">
        <div className="flex items-center">
          <button onClick={handleBack} className="p-1 cursor-pointer active:scale-95 transition-transform duration-200">
            <ArrowBackIcon className="active:scale-95 transition-transform duration-200" />
          </button>
          <h1 className="text-xl font-medium ml-2">Select City</h1>
        </div>
        <p className="text-sm mt-1 ml-1">Please Select your City from below or allow access to your location to detect automatically</p>
        
        {/* Search & Filter Bar */}
        <div className="mt-4 flex gap-2 active:scale-95 transition-transform duration-200">
          <div className="relative flex-1 active:scale-95 transition-transform duration-200">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-800 focus:outline-none"
            />
          </div>
          
        </div>
      </div>

      {/* Cities List */}
      <div className="p-4">
        {filteredCities.map((city) => (
          <div
            key={city.cityId}
            onClick={() => handleCitySelect(city.cityId)}
            className={`group p-4 mb-2 rounded-[12px] flex items-center justify-between cursor-pointer hover:bg-[#FFF1EE] hover:border-1 hover:border-[#FF583A] hover:-translate-y-0.5 active:scale-95 transition-transform duration-200
              ${selectedCityId === city.cityId 
                ? 'border-1 border-[#FF583A] bg-[#FFF1EE] shadow-md' 
                : 'border-1 border-gray-200'}`}
            style={{
              opacity: city.Campus && city.Campus.length > 0 ? 1 : 0.5
            }}
          >
            <div className="flex items-center">
              {/* <div className="w-10 h-10 rounded-full bg-[#FF583A]/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF583A]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div> */}
              <div>
                <h3 className="font-medium text-gray-900">{city.city}</h3>
                <p className="text-sm text-gray-500">{city.state}</p>
              </div>
            </div>
            
            {selectedCityId === city.cityId && (
              <div className="flex items-center text-[#FF583A]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCity;
export { SelectCity };