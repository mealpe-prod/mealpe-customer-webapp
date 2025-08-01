import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dummyRestaurant from "../../assets/1.png";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CartChip from "../../components/CartChip";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import EggIcon from "@mui/icons-material/Egg";
import CircleIcon from "@mui/icons-material/Circle";
import Check from "@mui/icons-material/Check";

// Components
import OutletHeader from "../../components/Outlet/OutletHeader";
import SearchBar from "../../components/Outlet/SearchBar";
import CategoryFilter from "../../components/Outlet/CategoryFilter";
import MenuSection from "../../components/Outlet/MenuSection";
import MenuItemCard from "../../components/Outlet/MenuItemCard";
import OutletDetailsSkeleton from "../../components/Outlet/OutletDetailsSkeleton";

const PRICE_MIN = 0;
const PRICE_MAX = 2000;

const OutletDetails = () => {
  const { user } = useSelector((state) => state.auth);
  const { outletId } = useParams();
  const [outletDetails, setOutletDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [availableMealTypes, setAvailableMealTypes] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [dietFilter, setDietFilter] = useState("all"); // "all", "veg", "nonveg", "egg"
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [drawerCategoryFilter, setDrawerCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const cartItemsCount = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  useEffect(() => {
    getOutletDetails();
  }, [user, outletId]);

  useEffect(() => {
    if (outletDetails && outletDetails.outdetails.hasMess) {
      fetchWeeklyMenu();
    }
  }, [outletDetails]);

  const fetchWeeklyMenu = async () => {
    if (!outletDetails?.outdetails?.hasMess || !outletId) return;

    setMenuLoading(true);
    setMenuError(null);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }mess/weeklyMenu/viewMenu/${outletId}`
      );

      if (response.data && response.data.success) {
        setWeeklyMenu(response.data);
        // Determine which meal types are available
        const mealTypes = [];
        const fullWeekMenu = response.data.fullWeekMenu;
        if (fullWeekMenu.Breakfast && fullWeekMenu.Breakfast.length > 0)
          mealTypes.push("Breakfast");
        if (fullWeekMenu.Lunch && fullWeekMenu.Lunch.length > 0)
          mealTypes.push("Lunch");
        if (fullWeekMenu.HighTea && fullWeekMenu.HighTea.length > 0)
          mealTypes.push("HighTea");
        if (fullWeekMenu.Dinner && fullWeekMenu.Dinner.length > 0)
          mealTypes.push("Dinner");
        setAvailableMealTypes(mealTypes);
      } else {
        setMenuError("Failed to fetch weekly menu");
      }
    } catch (error) {
      console.error("Error fetching weekly menu:", error);
      setMenuError("Failed to fetch weekly menu. Please try again.");
    } finally {
      setMenuLoading(false);
    }
  };

  const getOutletDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/cafeteriaDetails/${outletId}/${user.customerAuthUID}`
      );
      if (response.data.success) {
        setOutletDetails(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <OutletDetailsSkeleton />;
  if (!outletDetails) return <div>No outlet details found.</div>;

  const { outdetails, menuItems } = outletDetails;

  // Filter menu items based on search query, active category, diet preference, category, and price range
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.itemname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemdescription &&
        item.itemdescription.toLowerCase().includes(searchQuery.toLowerCase()));

    // Use drawerCategoryFilter if set, else activeCategory
    const categoryToFilter = drawerCategoryFilter !== "all" ? drawerCategoryFilter : activeCategory;

    const matchesCategory =
      categoryToFilter === "all" ||
      item?.item_categoryid?.categoryid === categoryToFilter;

    // Filter by diet type (attributeid: 1=veg, 2=non-veg, 3=egg)
    const matchesDiet =
      dietFilter === "all" ||
      (dietFilter === "veg" && item.attributeid === 1) ||
      (dietFilter === "nonveg" && item.attributeid === 2) ||
      (dietFilter === "egg" && item.attributeid === 3);

    // Price filter
    const price = Number(item.price) || 0;
    const matchesPrice =
      price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesDiet && matchesPrice;
  });

  // Get recommended items
  const recommendedItems = filteredMenuItems.filter(
    (item) => item.isRecommendedItem
  );

  const handleAccordionChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleDietFilterChange = (filter) => {
    setDietFilter(filter);
    // setFilterDrawerOpen(false); // Don't close drawer on diet change
  };

  const openFilterDrawer = () => {
    setDrawerCategoryFilter(activeCategory);
    setFilterDrawerOpen(true);
  };

  const closeFilterDrawer = () => {
    setFilterDrawerOpen(false);
  };

  // Handle category change in drawer
  const handleDrawerCategoryChange = (categoryId) => {
    setDrawerCategoryFilter(categoryId);
  };

  // Handle price range change in drawer
  const handlePriceRangeChange = (e, idx) => {
    let value = e.target.value;
    if (value === "") value = "";
    else value = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(value)));
    setPriceRange((prev) => {
      const newRange = [...prev];
      newRange[idx] = value;
      // Ensure min <= max
      if (idx === 0 && value > prev[1]) newRange[1] = value;
      if (idx === 1 && value < prev[0]) newRange[0] = value;
      return newRange;
    });
  };

  // Apply filters from drawer
  const handleApplyFilters = () => {
    setActiveCategory(drawerCategoryFilter);
    setFilterDrawerOpen(false);
  };

  // Reset filters in drawer
  const handleResetFilters = () => {
    setDrawerCategoryFilter("all");
    setDietFilter("all");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  };

  return (
    <div className="w-full mx-auto">
      <OutletHeader
        outletDetails={outdetails}
        weeklyMenu={weeklyMenu}
        availableMealTypes={availableMealTypes}
        loading={menuLoading}
        error={menuError}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openFilterDrawer={openFilterDrawer}
      />

      {(searchQuery || dietFilter !== "all" || activeCategory !== "all" || priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX) && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 text-sm text-gray-700">
          <Check fontSize="small" className="w-4 h-4 text-[#FF583A]" />
          <span className="font-medium">{filteredMenuItems.length}</span>
          <span className="text-gray-500">
            {filteredMenuItems.length === 1
              ? "match "
              : "matches "}
            for "{searchQuery || dietFilter || (activeCategory !== "all" && outdetails.Menu_Categories?.find(c => c.categoryid === activeCategory)?.categoryname) || "filters"}"
          </span>
        </div>
      )}

      <CategoryFilter
        categories={outdetails.Menu_Categories}
        hasMess={outdetails.hasMess}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={closeFilterDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "80%",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <div className="p-4">
          {/* Drawer handle */}
          <div className="flex justify-center">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Filter</h3>
            <button
              onClick={closeFilterDrawer}
              className="rounded-full hover:bg-gray-100 transition-colors duration-300 active:scale-95 cursor-pointer"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          {/* Category Filter in Drawer */}
          <div className="mb-8">
            <h4 className="text-base font-semibold text-gray-700 mb-4">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2 justify-start">
              <button
                className={`px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer text-xs font-medium ${
                  drawerCategoryFilter === "all"
                    ? "bg-[#FF583A]/10 border-[#FF583A] text-[#FF583A]"
                    : "bg-white border-gray-200 text-gray-800 hover:border-[#FF583A]/50 hover:bg-[#FF583A]/5"
                }`}
                onClick={() => handleDrawerCategoryChange("all")}
              >
                All
              </button>
              {outdetails.Menu_Categories?.filter((cat) => cat.status).map((cat) => (
                <button
                  key={cat.categoryid}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer text-xs font-medium ${
                    drawerCategoryFilter === cat.categoryid
                      ? "bg-[#FF583A]/10 border-[#FF583A] text-[#FF583A]"
                      : "bg-white border-gray-200 text-gray-800 hover:border-[#FF583A]/50 hover:bg-[#FF583A]/5"
                  }`}
                  onClick={() => handleDrawerCategoryChange(cat.categoryid)}
                >
                  {cat.categoryname}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <h4 className="text-base font-semibold text-gray-700 mb-4">
              Price Range (₹)
            </h4>
            {/* Show actual price range available */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500">
                Available: ₹{PRICE_MIN} - ₹{PRICE_MAX}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {/* Slider for price range */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(e, 0)}
                className="w-full accent-[#FF583A]"
                step={1}
                style={{ marginBottom: 0 }}
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(e, 1)}
                className="w-full accent-[#FF583A]"
                step={1}
                style={{ marginTop: 0 }}
              />
              
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Selected: ₹{priceRange[0]} &nbsp; - &nbsp; ₹{priceRange[1]}
            </div>
          </div>

          {/* Diet Preferences */}
          <div className="mb-8">
            <h4 className="text-base font-semibold text-gray-700 mb-4">
              Diet Preferences
            </h4>
            <div className="flex flex-wrap gap-2 justify-start">
              <button
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  dietFilter === "all"
                    ? "bg-[#FF583A]/10 border border-[#FF583A]"
                    : "bg-white border border-gray-200 hover:border-[#FF583A]/50 hover:bg-[#FF583A]/5"
                }`}
                onClick={() => handleDietFilterChange("all")}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center mr-1 ${
                    dietFilter === "all" ? "bg-[#FF583A]" : "bg-gray-100"
                  }`}
                >
                  <RestaurantIcon
                    style={{
                      color: dietFilter === "all" ? "white" : "#FF583A",
                      fontSize: "12px",
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    dietFilter === "all" ? "text-[#FF583A]" : "text-gray-800"
                  }`}
                >
                  All Items
                </span>
              </button>

              <button
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  dietFilter === "veg"
                    ? "bg-green-50 border border-green-600"
                    : "bg-white border border-gray-200 hover:border-green-600/50 hover:bg-green-50/50"
                }`}
                onClick={() => handleDietFilterChange("veg")}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center mr-1 ${
                    dietFilter === "veg" ? "bg-green-600" : ""
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="11"
                      height="11"
                      rx="1"
                      stroke={dietFilter === "veg" ? "white" : "#22c55e"}
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle
                      cx="6"
                      cy="6"
                      r="4"
                      fill={dietFilter === "veg" ? "white" : "#22c55e"}
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium ${
                    dietFilter === "veg" ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  Vegetarian
                </span>
              </button>

              <button
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  dietFilter === "nonveg"
                    ? "bg-red-50 border border-red-600"
                    : "bg-white border border-gray-200 hover:border-red-600/50 hover:bg-red-50/50"
                }`}
                onClick={() => handleDietFilterChange("nonveg")}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center mr-1 ${
                    dietFilter === "nonveg" ? "bg-red-600" : ""
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="11"
                      height="11"
                      rx="1"
                      stroke={dietFilter === "nonveg" ? "white" : "#dc2626"}
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M6 2L10 9H2L6 2Z"
                      fill={dietFilter === "nonveg" ? "white" : "#dc2626"}
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium ${
                    dietFilter === "nonveg" ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  Non-Veg
                </span>
              </button>

              <button
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  dietFilter === "egg"
                    ? "bg-yellow-50 border border-yellow-500"
                    : "bg-white border border-gray-200 hover:border-yellow-500/50 hover:bg-yellow-50/50"
                }`}
                onClick={() => handleDietFilterChange("egg")}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center mr-1 ${
                    dietFilter === "egg" ? "bg-yellow-500" : ""
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="11"
                      height="11"
                      rx="1"
                      stroke={dietFilter === "egg" ? "white" : "#ca8a04"}
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle
                      cx="6"
                      cy="6"
                      r="3"
                      fill={dietFilter === "egg" ? "white" : "#ca8a04"}
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium ${
                    dietFilter === "egg" ? "text-yellow-500" : "text-gray-800"
                  }`}
                >
                  Contains Egg
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button
              onClick={handleResetFilters}
              className="w-1/3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-200 active:scale-98 transition-all duration-200"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="w-2/3 py-2 bg-[#FF583A] text-white rounded-xl font-medium text-base shadow-lg shadow-[#FF583A]/30 hover:bg-[#FF583A]/90 active:scale-98 transition-all duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Drawer>

      <div className="mb-26 px-2">
        {activeCategory === "all" ? (
          <div>
            {/* Recommended Items Section */}
            {recommendedItems.length > 0 && (
              <MenuSection
                title="Recommended Items"
                items={recommendedItems}
                // expanded={expanded === 'panel-recommended'}
                onChange={handleAccordionChange("panel-recommended")}
                defaultExpanded={true}
              />
            )}

            {/* Category Sections */}
            {outdetails?.Menu_Categories?.filter(
              (category) => category.status === true
            )?.map((category) => (
              <MenuSection
                key={category.categoryid}
                title={category.categoryname}
                items={filteredMenuItems.filter(
                  (item) =>
                    item?.item_categoryid?.categoryid === category.categoryid
                )}
                expanded={expanded === `panel${category.categoryid}`}
                onChange={handleAccordionChange(`panel${category.categoryid}`)}
              />
            ))}

            {/* Other Items Section (for items with null category) */}
            {filteredMenuItems.filter((item) => !item.item_categoryid).length >
              0 && (
              <MenuSection
                key="other-category"
                title="Other"
                items={filteredMenuItems.filter(
                  (item) => !item.item_categoryid
                )}
                // expanded={expanded === 'panel-other'}
                defaultExpanded={outdetails.hasMess}
                onChange={handleAccordionChange("panel-other")}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredMenuItems.map((item) => (
              <MenuItemCard key={item.itemid} item={item} />
            ))}
          </div>
        )}
      </div>
      <CartChip />
    </div>
  );
};

export default OutletDetails;
