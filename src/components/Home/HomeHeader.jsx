import React from "react";
import { useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import Hamburger from "../../assets/hamburger.png";
import Avatar from "../../assets/avatar.png";
import axios from "axios";

const HomeHeader = ({
  showSidebar,
  setShowSidebar,
  currentCity,
  currentCampus,
  isLoading,
  handleLocationClick,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  user,
  updateRestaurantsByCategory,
  setRestaurantsLoading,
}) => {
  const navigate = useNavigate();

  const handleCategorySelect = async (categoryId) => {
    try {
      setSelectedCategory(categoryId);
      setRestaurantsLoading(true);

      if (categoryId) {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getOutletList/${
            user?.campusId?.campusId
          }?cuid=${
            user?.customerAuthUID
          }&page=0&perPage=10&searchText=${searchQuery}&categoryId=${categoryId}`
        );

        if (response.data.success) {
          // Pass the filtered outlets to parent component using props
          updateRestaurantsByCategory(response.data.data);
        }
      } else {
        // If "All" is selected, fetch all outlets
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getOutletList/${
            user?.campusId?.campusId
          }?cuid=${user?.customerAuthUID}${
            searchQuery ? `&searchText=${searchQuery}` : ""
          }`
        );

        if (response.data.success) {
          updateRestaurantsByCategory(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching outlets by category:", error);
      setRestaurantsLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If a category is selected, we need to refetch with the new search query
    if (selectedCategory) {
      try {
        setRestaurantsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getOutletList/${
            user?.campusId?.campusId
          }?cuid=${
            user?.customerAuthUID
          }&page=0&perPage=10&searchText=${value}&categoryId=${selectedCategory}`
        );

        if (response.data.success) {
          updateRestaurantsByCategory(response.data.data);
        }
      } catch (error) {
        console.error("Error searching with category:", error);
        setRestaurantsLoading(false);
      }
    }
  };

  return (
    <header className="bg-white shadow-sm rounded-b-[12px] sticky top-0 z-10 mt-1 md:mt-2">
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="flex items-center justify-between border-b border-gray-200">
          {/* User Avatar */}
          <div
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full mr-2 bg-gray-200 overflow-hidden hover:cursor-pointer active:scale-95 transition-all duration-300 hover:bg-gray-100 hover:shadow-md relative group ring-2 ring-transparent hover:ring-[#FF583A]/20"
            aria-label="View profile"
          >
            <img
              src={user?.photo || Avatar}
              alt="User"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
          </div>
          {/* Location Selector */}
          <button
            onClick={handleLocationClick}
            className="flex-1 flex items-center cursor-pointer hover:bg-[#FFF1EE] rounded-[12px] py-1 mb-2 active:scale-95 transition-all duration-300 group border border-transparent hover:border-[#FF583A]/20"
            aria-label="Change location"
          >
            <div className="flex items-center w-full">
              <LocationOnIcon className="text-[#FF583A] mr-1.5 group-hover:animate-bounce" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium flex items-center text-[#FF583A]">
                  Current Location{" "}
                  <KeyboardArrowDownIcon className="text-gray-400 group-hover:rotate-180 transition-transform duration-300" />
                </div>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#FF583A] border-t-transparent rounded-[12px] animate-spin"></div>
                    <span className="text-xs text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 truncate max-w-[170px] md:max-w-[600px] group-hover:text-[#FF583A]/80 transition-colors duration-300 font-medium">
                    {currentCampus
                      ? `${currentCampus}, ${currentCity}`
                      : "Select your location"}
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 rounded-[12px] hover:bg-gray-100 cursor-pointer active:scale-95 transition-all duration-200 hover:shadow-md flex items-center justify-center"
            aria-label="Open menu"
          >
            <img
              src={Hamburger}
              alt="Hamburger"
              className="w-6 h-6 hover:rotate-3 transition-transform"
            />
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="mt-3 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search restaurants"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 pl-12 pr-12 text-sm rounded-[12px] border border-gray-200 focus:outline-none focus:border-[#FF583A] focus:ring-2 focus:ring-[#FF583A]/10 transition-all duration-300 shadow-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF583A]">
              <SearchIcon fontSize="small" />
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors duration-200"
                aria-label="Clear search"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex space-x-2 whitespace-nowrap py-1">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`px-3 py-1.5 rounded-[12px] text-sm transition-all duration-300 flex items-center active:scale-95 cursor-pointer ${
                    !selectedCategory
                      ? "bg-[#FF583A] text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[#FF583A] hover:text-[#FF583A]"
                  }`}
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    onClick={() => handleCategorySelect(category.categoryId)}
                    className={`px-3 py-1.5 cursor-pointer rounded-[12px] text-sm transition-all duration-300 flex items-center min-w-fit active:scale-95 ${
                      selectedCategory === category.categoryId
                        ? "bg-[#FF583A] text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-[#FF583A] hover:text-[#FF583A]"
                    }`}
                  >
                    <span className="truncate">{category.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
