import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import CartChip from "../../components/CartChip";
import LiveOrdersSlider from "../../components/LiveOrdersSlider";
import BirthdayWish from "../../components/BirthdayWish";

// Import modular components
import HomeHeader from "../../components/Home/HomeHeader";
import FilterToggle from "../../components/Home/FilterToggle";
import RestaurantList from "../../components/Home/RestaurantList";

const Home = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentCity, setCurrentCity] = useState("");
  const [currentCampus, setCurrentCampus] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [hasMess, setHasMess] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "mess", "outlet"
  const [liveOrders, setLiveOrders] = useState([]);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const ordersContainerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryFiltered, setIsCategoryFiltered] = useState(false);
  const [showBirthdayWish, setShowBirthdayWish] = useState(false);
  
  // Debounce search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Check if today is user's birthday
  const checkBirthday = useCallback(() => {
    if (!user?.dob) return false;
    
    const today = new Date();
    const dob = new Date(user.dob);
    
    // Compare month and day only (not year)
    return today.getDate() === dob.getDate() && 
           today.getMonth() === dob.getMonth();
  }, [user?.dob]);

  // Check if birthday wish was already shown today
  const shouldShowBirthdayWish = useCallback(() => {
    if (!checkBirthday()) return false;
    
    // Check if we already showed the birthday wish today
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem(`birthday_wish_shown_${user?.customerAuthUID}`);
    
    return lastShownDate !== today;
  }, [checkBirthday, user?.customerAuthUID]);

  // Mark birthday wish as shown for today
  const markBirthdayWishAsShown = useCallback(() => {
    if (user?.customerAuthUID) {
      const today = new Date().toDateString();
      localStorage.setItem(`birthday_wish_shown_${user?.customerAuthUID}`, today);
    }
  }, [user?.customerAuthUID]);

  // For testing purposes - can be removed in production
  const testBirthdayWish = () => {
    // Clear the localStorage entry to allow showing the birthday wish again
    if (user?.customerAuthUID) {
      localStorage.removeItem(`birthday_wish_shown_${user?.customerAuthUID}`);
      setShowBirthdayWish(true);
    }
  };

  useEffect(() => {
    // Simulate loading for 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    if (user?.campusId?.campusId) {
      setCurrentCity(user.campusId.cityId.city);
      setCurrentCampus(user.campusId.campusName);
    } else {
      navigate("/select-city");
    }

    // Check if it's user's birthday and we haven't shown the wish yet today
    if (shouldShowBirthdayWish()) {
      // Show birthday wish after a short delay
      const birthdayTimer = setTimeout(() => {
        setShowBirthdayWish(true);
        markBirthdayWishAsShown();
      }, 1500);
      return () => {
        clearTimeout(timer);
        clearTimeout(birthdayTimer);
      };
    }

    // Cleanup timer
    return () => clearTimeout(timer);
  }, [user, shouldShowBirthdayWish, markBirthdayWishAsShown, navigate]);

  const handleLocationClick = () => {
    navigate("/select-city");
  };

  useEffect(() => {
    user?.campusId?.campusId && fetchRestaurants();
    fetchCategories();
  }, [user?.campusId?.campusId]);

  // Handle search query changes when no category is selected
  useEffect(() => {
    if (!selectedCategory && !isCategoryFiltered && restaurants.length > 0) {
      // Filter restaurants based on search query and filter type
      const filtered = restaurants.filter((restaurant) => {
        const matchesSearch =
          restaurant.outlet_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
          filter === "all"
            ? true
            : filter === "mess"
            ? restaurant.hasMess
            : !restaurant.hasMess;

        return matchesSearch && matchesFilter;
      });

      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, filter, restaurants, selectedCategory, isCategoryFiltered]);

  // Handle filter changes (mess/outlet) when category is filtered
  useEffect(() => {
    if (isCategoryFiltered && restaurants.length > 0) {
      // Apply only mess/outlet filter, not category filter (as it's already filtered by API)
      const filtered = restaurants.filter((restaurant) => {
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "mess"
            ? restaurant.hasMess
            : !restaurant.hasMess;
        
        return matchesFilter;
      });
      
      setFilteredRestaurants(filtered);
    }
  }, [filter, restaurants, isCategoryFiltered]);

  useEffect(() => {
    // Check if any restaurant has mess
    const messExists = restaurants.some((restaurant) => restaurant.hasMess);
    setHasMess(messExists);

    // If mess exists and there's only 1 restaurant, set filter to "mess"
    if (messExists && restaurants.length === 1) {
      setFilter("mess");
    }
    // If no mess exists and filter is set to mess, reset to all
    else if (!messExists && filter === "mess") {
      setFilter("all");
    }
  }, [restaurants]);

  const fetchRestaurants = async () => {
    try {
      setRestaurantsLoading(true);
      setIsCategoryFiltered(false);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getOutletList/${
          user?.campusId?.campusId
        }?cuid=${user?.customerAuthUID}`
      );

      if (response.data.success) {
        setRestaurants(response.data.data);
        setFilteredRestaurants(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.customerAuthUID) {
      fetchLiveOrders();
    }
  }, [user?.customerAuthUID]);

  const fetchLiveOrders = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/getLiveCustomerOrders/${user?.customerAuthUID}`
      );

      if (response.data.success) {
        setLiveOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching live orders:", error);
    }
  };

  const refreshOrders = async () => {
    setRefreshingOrders(true);
    try {
      await fetchLiveOrders();
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshingOrders(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}category/getCategoryList`
      );

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Function to update restaurants when category is selected
  const updateRestaurantsByCategory = (data) => {
    setIsCategoryFiltered(true);
    setRestaurants(data);
    
    // Apply only mess/outlet filter, not category filter (as it's already filtered by API)
    const filtered = data.filter((restaurant) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "mess"
          ? restaurant.hasMess
          : !restaurant.hasMess;
      
      return matchesFilter;
    });
    
    setFilteredRestaurants(filtered);
    setRestaurantsLoading(false);
  };

  return (
    <div className="min-h-screen relative pb-24">
      {/* Birthday Wish Modal */}
      {showBirthdayWish && (
        <BirthdayWish 
          userName={user?.customerName || "Friend"} 
          onClose={() => setShowBirthdayWish(false)} 
        />
      )}
      
      {/* Header Component */}
      <HomeHeader
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        currentCity={currentCity}
        currentCampus={currentCampus}
        isLoading={isLoading}
        handleLocationClick={handleLocationClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        user={user}
        updateRestaurantsByCategory={updateRestaurantsByCategory}
        setRestaurantsLoading={setRestaurantsLoading}
        testBirthdayWish={testBirthdayWish} // For testing purposes
      />

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Toggle Component */}
        {/* <FilterToggle 
          hasMess={hasMess} 
          restaurantsCount={restaurants.length} 
          filter={filter} 
          setFilter={setFilter} 
        /> */}
        
        {/* Restaurant List Component */}
        <RestaurantList 
          filteredRestaurants={filteredRestaurants}
          restaurantsLoading={restaurantsLoading}
          searchQuery={searchQuery}
        />
      </main>

      {/* Cart Chip - Only show when items in cart */}
      <CartChip liveOrders={liveOrders} />

      {/* Live Orders Slider */}
      <LiveOrdersSlider
        liveOrders={liveOrders}
        refreshOrders={refreshOrders}
        refreshingOrders={refreshingOrders}
      />
    </div>
  );
};

export default Home;
