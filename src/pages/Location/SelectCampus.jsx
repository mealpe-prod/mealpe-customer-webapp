import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { SkeletonLoader } from "../../components/SkeletonLoader";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import Toast from "../../components/Toast";

const SelectCampus = () => {
  const [campuses, setCampuses] = useState([]);
  const [filteredCampuses, setFilteredCampuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.user);
  const { cityId } = useParams();

  useEffect(() => {
    fetchCampuses();

    const campusId = JSON.parse(localStorage.getItem("campusData"));
    if (campusId) {
      setSelectedCampusId(campusId.campusId);
    }
  }, [cityId]);

  useEffect(() => {
    if (campuses.length > 0) {
      const filtered = campuses.filter((campus) =>
        campus.campusName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCampuses(filtered);
    }
  }, [searchQuery, campuses]);

  const fetchCampuses = async () => {
    const organizationCode = localStorage.getItem('organizationCode');
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}campus/getCampus/${cityId}?${organizationCode ? `organizationCode=${organizationCode}` : ''}`
      );
      if (response.data.success) {
        setCampuses(response.data.data);
        setFilteredCampuses(response.data.data);
        if (response.data.data.length > 0) {
          setCityName(response.data.data[0].cityId.city);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch campuses");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCampusSelect = async (campus) => {
    try {
      setUpdating(true);

      // Store required campus fields
      const campusData = {
        campusId: campus.campusId,
        address: campus.address,
        campusName: campus.campusName,
        isActive: campus.isActive,
        organizationId: campus.organizationId,
        tag: campus.tag || "",
      };
      localStorage.setItem("campusData", JSON.stringify(campusData));

      // Update user profile with new campus
      if (userData?.customerAuthUID) {
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
          // Toast.success("Campus updated successfully!");
        } else {
          throw new Error(response.data.message || "Failed to update campus");
        }
      }

      // Navigate to home
      navigate("/home");
    } catch (error) {
      console.error("Error updating campus:", error);
      Toast.error(
        error.message || "Failed to update campus. Please try again."
      );
    } finally {
      setUpdating(false);
    }
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
            <h1 className="text-xl font-medium ml-2">Select Campus</h1>
          </div>
          <p className="text-sm mt-1 ml-1">
            Please Select your Campus from below
          </p>

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
          <SkeletonLoader type="campus" />
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
            onClick={fetchCampuses}
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
          <h1 className="text-xl font-medium ml-2">Select Campus</h1>
        </div>
        <p className="text-sm mt-1 ml-1">
          Please Select your Campus from below
        </p>

        {/* Search Bar */}
        <div className="mt-4 relative active:scale-95 transition-transform duration-200">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Campuses List */}
      <div className="p-4">
        {filteredCampuses.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No campuses found
          </div>
        ) : (
          filteredCampuses.map((campus) => (
            <div
              key={campus.campusId}
              onClick={() => handleCampusSelect(campus)}
              className={`group p-4 mb-3 rounded-[12px] flex items-center justify-between cursor-pointer active:scale-95 transition-transform duration-200
                ${
                  selectedCampusId === campus.campusId
                    ? "border-1 border-[#FF583A] bg-[#FFF1EE] shadow-md"
                    : "bg-white hover:bg-[#FFF1EE] hover:border-1 hover:border-[#FF583A] hover:-translate-y-0.5 border border-gray-200"
                }`}
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  {campus.campusName}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {campus.address || cityName}
                </p>
                {/* {campus.organizationId && (
                  <div className="mt-2">
                    <span className="text-xs bg-[#FF583A]/10 text-[#FF583A] px-3 py-1 rounded-full">
                      {campus.organizationId.organizationName}
                    </span>
                  </div>
                )} */}
              </div>

              {selectedCampusId === campus.campusId && (
                <div className="flex items-center text-[#FF583A]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SelectCampus;
