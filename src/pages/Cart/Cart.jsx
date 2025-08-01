import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from "../../redux/slices/cartSlice";
import axios from "axios";

// Import components
import CartHeader from "../../components/Cart/CartHeader";
import RestaurantInfo from "../../components/Cart/RestaurantInfo";
import OrderTypeSelection from "../../components/Cart/OrderTypeSelection";
import DeliveryAddressInput from "../../components/Cart/DeliveryAddressInput";
import CartItems from "../../components/Cart/CartItems";
import ScheduleSelection from "../../components/Cart/ScheduleSelection";
import AdditionalInstructions from "../../components/Cart/AdditionalInstructions";
import PaymentMode from "../../components/Cart/PaymentMode";
import OrderSummary from "../../components/Cart/OrderSummary";
import ScheduleModal from "../../components/Cart/ScheduleModal";
import MessScheduleModal from "../../components/Cart/MessScheduleModal";
import EmptyCart from "../../components/Cart/EmptyCart";
import ContinueButton from "../../components/Cart/ContinueButton";
import { MapPin, X } from "lucide-react";
import PlusIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const [outletDetails, setOutletDetails] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [addressList, setAddressList] = useState([]);
  const customerAuthId = useSelector(
    (state) => state.auth.user?.customerAuthUID
  );
  const outletId = useSelector((state) => state?.cart?.items[0]?.outletId);

  // States for order selection
  const [orderType, setOrderType] = useState("dining");
  const [scheduleType, setScheduleType] = useState("now");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [instruction, setInstruction] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  // States for schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  // Loading state for price breakdown
  const [loadingPrices, setLoadingPrices] = useState(false);

  // States for outlet delivery addresses
  const [outletDeliveryAddresses, setOutletDeliveryAddresses] = useState([]);
  const [selectedOutletDeliveryAddress, setSelectedOutletDeliveryAddress] = useState(null);
  const [showOutletAddressModal, setShowOutletAddressModal] = useState(false);

  // Calculate item totals
  const calculateItemTotal = (item) => {
    let total = item.price || 0;

    // Add variation price if any
    if (item.extra && item.extra.length > 0) {
      total = item.extra[0].price || 0;
    }

    // Add addons price if any
    if (item.addons) {
      Object.values(item.addons).forEach((addonGroup) => {
        if (addonGroup.selectedItemsAddonData) {
          addonGroup.selectedItemsAddonData.forEach((addon) => {
            total += parseFloat(addon.price) || 0;
          });
        }
      });
    }

    return total * (item.qty || 1);
  };

  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + calculateItemTotal(item),
    0
  );

  // State for price breakdown
  const [priceBreakdown, setPriceBreakdown] = useState({
    convenienceTotalAmount: 0,
    deliveryCharge: 0,
    packagingCharge: 0,
    totalPriceForCustomer: 0,
    foodGST: 0,
    FoodBasePrice: 0,
    isGstApplied: false,
    isAcceptingCash: true,
    isAcceptingWallet: true,
    isAcceptingOnline: true,
  });

  // Get price breakdown from API
  const getPriceBreakdown = async () => {
    try {
      setLoadingPrices(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }payment/customer/get-price-breakdown`,
        {
          outletId: outletId,
          itemTotalPrice: subtotal,
          isDineIn: orderType === "dining",
          isPickUp: orderType === "takeaway",
          isDelivery: orderType === "delivery",
        }
      );

      if (response.data.success) {
        // Map response to our state structure
        setPriceBreakdown({
          convenienceTotalAmount: response.data.convenienceTotalAmount || 0,
          deliveryCharge: response.data.deliveryCharge || 0,
          packagingCharge: response.data.packagingCharge || 0,
          totalPriceForCustomer:
            response.data.totalPriceForCustomer || subtotal,
          foodGST: response.data.foodGST || 0,
          FoodBasePrice: response.data.FoodBasePrice || 0,
          isGstApplied: response.data.isGstApplied || false,
          isAcceptingCash: response.data.isAcceptingCash || false,
          isAcceptingWallet: response.data.isAcceptingWallet || false,
          isAcceptingOnline: response.data.isAcceptingOnline || false,
        });
      } else {
        console.log("Failed to get price breakdown:", response.data.message);
      }
    } catch (error) {
      console.log("Error getting price breakdown:", error);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Handle increase item quantity
  const handleIncreaseQuantity = (item) => {
    dispatch(increaseQuantity(item));
  };

  // Handle decrease item quantity
  const handleDecreaseQuantity = (item) => {
    dispatch(decreaseQuantity(item));
  };

  // Handle remove all items
  const handleRemoveAll = () => {
    dispatch(clearCart());
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  useEffect(() => {
    outletId && customerAuthId && getOutletDetails();
    customerAuthId && getWalletBalance();
  }, [outletId, customerAuthId]);

  // Set schedule type to 'later' if outlet is a mess
  useEffect(() => {
    if (outletDetails?.outdetails?.hasMess) {
      setScheduleType("later");
    } else if (showScheduleModal === false) {
      // Only check and potentially override scheduleType if not currently showing the schedule modal
      // This prevents overriding user selections made in the modal

      // Check if outlet is currently open
      const isOpen = outletDetails?.outdetails?.isOutletOpen || false;

      // Check if current time is within outlet hours
      const isWithinHours = () => {
        if (!outletDetails?.outdetails?.Timing?.Today) return false;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHours * 60 + currentMinutes;

        const openTime = outletDetails.outdetails.Timing.Today.openTime;
        const closeTime = outletDetails.outdetails.Timing.Today.closeTime;

        const [openHours, openMinutes] = openTime.split(":").map(Number);
        const [closeHours, closeMinutes] = closeTime.split(":").map(Number);

        const openTimeInMinutes = openHours * 60 + openMinutes;
        const closeTimeInMinutes = closeHours * 60 + closeMinutes;

        return (
          currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes
        );
      };

      // If outlet is not open, default to 'later'
      // BUT don't override if scheduleType is already set
      if ((!isOpen || !isWithinHours()) && scheduleType !== "now") {
        setScheduleType("later");
      } else if (isOpen && isWithinHours() && !scheduleType) {
        // If the outlet is open and within hours, and no schedule type is set yet, set to 'now'
        setScheduleType("now");
      }
    }
  }, [outletDetails, scheduleType, showScheduleModal]);

  useEffect(() => {
    if (outletId && subtotal > 0) {
      getPriceBreakdown();
    }
  }, [outletId, subtotal, orderType]);

  // Set default payment mode based on price breakdown API response
  useEffect(() => {
    if (priceBreakdown.isAcceptingCash) {
      setPaymentMode("cash");
    } else if (priceBreakdown.isAcceptingWallet && walletBalance > 0) {
      setPaymentMode("wallet");
    } else if (priceBreakdown.isAcceptingOnline) {
      setPaymentMode("online");
    }
  }, [priceBreakdown]);

  // Get formatted date
  const getFormattedDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Get min and max time based on outlet timing
  const getOutletTimingForDay = (date) => {
    const dayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const today = new Date();
    const dayOfWeek = date.getDay();
    const dayName = dayMap[dayOfWeek];

    // Check if date is today, tomorrow or day after tomorrow
    let timing;
    if (date.toDateString() === today.toDateString()) {
      timing = outletDetails?.outdetails?.Timing?.Today;
    } else if (
      date.toDateString() ===
      new Date(today.setDate(today.getDate() + 1)).toDateString()
    ) {
      timing = outletDetails?.outdetails?.Timing?.Tomorrow;
    } else if (
      date.toDateString() ===
      new Date(today.setDate(today.getDate() + 1)).toDateString()
    ) {
      timing = outletDetails?.outdetails?.Timing?.Overmorrow;
    }

    // If timing is not available for specific day, use default timing
    if (!timing || !timing.openTime || !timing.closeTime) {
      return {
        openTime: outletDetails?.outdetails?.openTime || "08:00:00",
        closeTime: outletDetails?.outdetails?.closeTime || "23:00:00",
        isOpen: true,
      };
    }

    return {
      openTime: timing.openTime,
      closeTime: timing.closeTime,
      isOpen:
        dayName === "Today"
          ? outletDetails?.outdetails?.todayisOutletOpen
          : dayName === "Tomorrow"
          ? outletDetails?.outdetails?.tomorrowisOutletOpen
          : dayName === "Overmorrow"
          ? outletDetails?.outdetails?.overmorrowisOutletOpen
          : true,
    };
  };

  // Handle schedule later button click
  const handleScheduleLater = () => {
    if (!outletDetails?.outdetails?.hasMess) {
      // For regular outlets
      setSelectedDate(new Date());
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);
    }
    setShowScheduleModal(true);
  };

  // Handle confirm schedule for regular outlets
  const handleConfirmSchedule = () => {
    // Check if date is not later than overmorrow
    const today = new Date();
    const overmorrow = new Date(today);
    overmorrow.setDate(today.getDate() + 2);

    // Reset hours, minutes, seconds and milliseconds for proper date comparison
    overmorrow.setHours(23, 59, 59, 999);

    if (selectedDate > overmorrow) {
      setScheduleError("You can only schedule orders up to 2 days in advance");
      return;
    }

    const timing = getOutletTimingForDay(selectedDate);

    if (!timing.isOpen) {
      setScheduleError("Restaurant is closed on selected date");
      return;
    }

    const [openHour, openMin] = timing.openTime.split(":").map(Number);
    const [closeHour, closeMin] = timing.closeTime.split(":").map(Number);
    const [selectedHour, selectedMin] = selectedTime.split(":").map(Number);

    const openTimeInMinutes = openHour * 60 + openMin;
    const closeTimeInMinutes = closeHour * 60 + closeMin;
    const selectedTimeInMinutes = selectedHour * 60 + selectedMin;

    // Check if selected time is in the past
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMin;

    if (isToday && selectedTimeInMinutes < currentTimeInMinutes) {
      setScheduleError("Cannot schedule for a time that has already passed");
      return;
    }

    if (
      selectedTimeInMinutes < openTimeInMinutes ||
      selectedTimeInMinutes > closeTimeInMinutes
    ) {
      setScheduleError(
        `Restaurant is only open from ${timing.openTime.slice(
          0,
          5
        )} to ${timing.closeTime.slice(0, 5)}`
      );
      return;
    }

    // If valid, update schedule type and close modal
    setScheduleType("later");
    setShowScheduleModal(false);
    setScheduleError("");
  };

  // Handle confirm schedule for mess outlets
  const handleConfirmMessSchedule = (dateObj) => {
    if (dateObj) {
      setScheduleType("later");
      setSelectedDate(
        new Date(dateObj.orderDate.split("-").reverse().join("-"))
      );
      setSelectedTime(dateObj.orderTime);
      setShowScheduleModal(false);
    }
  };

  const getOutletDetails = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/cafeteriaDetails/${outletId}/${customerAuthId}`
      );
      if (response.data.success) {
        setOutletDetails(response.data.data);

        // Set default order type based on outlet capabilities
        if (response.data.data?.outdetails?.isDineIn) {
          setOrderType("dining");
        } else if (response.data.data?.outdetails?.isPickUp) {
          setOrderType("takeaway");
        } else if (response.data.data?.outdetails?.isDelivery) {
          setOrderType("delivery");
        }

        // Payment modes will now be set by the price breakdown API response
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getWalletBalance = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }wallet/userWallet/getWalletData/${customerAuthId}`
      );
      setWalletBalance(response.data.response.balance);
    } catch (error) {
      console.log(error);
    }
  };

  // Check if outlet is open now
  const isOutletOpen = outletDetails?.outdetails?.isOutletOpen || false;

  // Get current time in hours and minutes
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get formatted selected date and time
  const getFormattedScheduleTime = () => {
    if (scheduleType === "now") {
      return `Today, ${getCurrentTime()}`;
    } else if (outletDetails?.outdetails?.hasMess) {
      // For mess orders, just return the full date since the time is predefined
      const options = { weekday: "long", month: "long", day: "numeric" };
      return `${selectedDate.toLocaleDateString(
        "en-US",
        options
      )}, ${selectedTime}`;
    } else {
      const options = { weekday: "long", month: "long", day: "numeric" };
      return `${selectedDate.toLocaleDateString(
        "en-US",
        options
      )}, ${selectedTime}`;
    }
  };

  // Update orderType and reset delivery address if switching from delivery
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    // Clear delivery address when switching away from delivery
    if (type !== "delivery") {
      setDeliveryAddress("");
    } else if (addressList.length > 0) {
      // Set the first address as default if available
      const firstAddress = addressList[0];
      setDeliveryAddress(
        `${firstAddress.customer_address_id}\n${firstAddress.label}\n${
          firstAddress.address_line_1
        }${
          firstAddress.address_line_2 ? `, ${firstAddress.address_line_2}` : ""
        }\n${firstAddress.locality ? `${firstAddress.locality}, ` : ""}${
          firstAddress.city
        }, ${firstAddress.state} - ${firstAddress.pincode}\n${
          firstAddress.delivery_instructions
            ? firstAddress.delivery_instructions
            : ""
        }`
      );
    }
  };

  const fetchAddressList = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/getCustomerAddresses/${customerAuthId}`
      );
      if (response.status === 200) {
        setAddressList(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  const fetchOutletDeliveryAddresses = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }outlet/getDeliveryAddresses/${outletId}`
      );
      if (response.data.success) {
        setOutletDeliveryAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch outlet delivery addresses", error);
    }
  };

  useEffect(() => {
    if (outletDetails?.outdetails?.allowCustomDeliveryLocation) {
      outletId && fetchOutletDeliveryAddresses();
    } else {
      fetchAddressList();
    }
  }, [
    customerAuthId,
    outletId,
    outletDetails?.outdetails?.allowCustomDeliveryLocation,
  ]);

  // If cart is empty, show empty cart component
  if (!items || items?.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen pb-6 bg-gray-50 text-sm sm:text-base">
      {/* Header */}
      <CartHeader />

      {/* Restaurant Info */}
      <RestaurantInfo
        outletDetails={outletDetails}
        isOutletOpen={isOutletOpen}
      />

      {/* Order Type Selection */}
      <OrderTypeSelection
        orderType={orderType}
        setOrderType={handleOrderTypeChange}
        outletDetails={outletDetails}
      />

      {/* Delivery Address Input - Only show when delivery is selected */}
      {orderType === "delivery" &&
        outletDetails?.outdetails?.allowCustomDeliveryLocation === false && (
          <>
            {deliveryAddress ? (
              <div className="w-full bg-white rounded-[12px] shadow p-4 flex flex-col gap-2 border border-gray-100 mb-4">
                {addressList
                  .filter(
                    (address) =>
                      address.customer_address_id ===
                      deliveryAddress.split("\n")[0]
                  )
                  .map((address) => (
                    <div
                      key={address.customer_address_id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 text-[#FF583A]" />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {address.label}
                        </div>
                        <div className="text-xs text-gray-700">
                          {address.address_line_1}
                          {address.address_line_2
                            ? `, ${address.address_line_2}`
                            : ""}
                          <br />
                          {address.locality ? `${address.locality}, ` : ""}
                          {address.city}, {address.state} - {address.pincode}
                        </div>
                        {address.delivery_instructions && (
                          <div className="text-xs text-gray-500 mt-1">
                            {address.delivery_instructions}
                          </div>
                        )}
                      </div>
                      <button
                        className="ml-auto text-[#FF583A] text-xs underline cursor-pointer active:scale-95 transition-all"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Change
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <button
                type="button"
                className="w-full bg-white rounded-[12px] shadow p-4 flex items-center gap-2 border border-gray-100 mb-4"
                onClick={() => setShowAddressModal(true)}
              >
                <MapPin className="w-5 h-5 text-[#FF583A]" />
                <span className="text-sm font-semibold text-gray-800 cursor-pointer active:scale-95 transition-transform duration-200">
                  Select Delivery Address
                </span>
              </button>
            )}

            {/* Modal for address selection */}
            {showAddressModal && (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              >
                <div className="bg-white rounded-t-lg shadow-lg w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer active:scale-95"
                    onClick={() => setShowAddressModal(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold mb-4">
                    Select Delivery Address
                  </h2>
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                    {addressList.length === 0 && (
                      <div className="text-gray-500 text-center">
                        No saved addresses found.
                      </div>
                    )}
                    {addressList.map((address) => {
                      const isSelected =
                        deliveryAddress ===
                        `${address.customer_address_id}\n${address.label}\n${
                          address.address_line_1
                        }${
                          address.address_line_2
                            ? `, ${address.address_line_2}`
                            : ""
                        }\n${address.locality ? `${address.locality}, ` : ""}${
                          address.city
                        }, ${address.state} - ${address.pincode}\n${
                          address.delivery_instructions
                            ? address.delivery_instructions
                            : ""
                        }`;
                      return (
                        <button
                          key={address.customer_address_id}
                          className={`w-full text-left bg-white rounded-[12px] shadow p-4 flex flex-col gap-2 border transition-all cursor-pointer active:scale-95
                                        ${
                                          isSelected
                                            ? "border-[#FF583A] ring-2 ring-[#FF583A]/30"
                                            : "border-gray-100 hover:border-[#FF583A]"
                                        }
                                    `}
                          onClick={() => {
                            setDeliveryAddress(
                              `${address.customer_address_id}\n${
                                address.label
                              }\n${address.address_line_1}${
                                address.address_line_2
                                  ? `, ${address.address_line_2}`
                                  : ""
                              }\n${
                                address.locality ? `${address.locality}, ` : ""
                              }${address.city}, ${address.state} - ${
                                address.pincode
                              }\n${
                                address.delivery_instructions
                                  ? address.delivery_instructions
                                  : ""
                              }`
                            );
                            setShowAddressModal(false);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-[#FF583A]" />
                              <span className="text-sm font-semibold text-gray-800">
                                {address.label}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="text-[#FF583A] font-bold text-xs">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 leading-snug">
                            <div>
                              {address.address_line_1}
                              {address.address_line_2
                                ? `, ${address.address_line_2}`
                                : ""}
                            </div>
                            <div>
                              {address.locality ? `${address.locality}, ` : ""}
                              {address.city}, {address.state} -{" "}
                              {address.pincode}
                            </div>
                          </div>
                          {address.delivery_instructions && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">
                                Delivery Instructions:
                              </span>{" "}
                              {address.delivery_instructions}
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {addressList.length > 0 && (
                      <button
                        onClick={() => navigate("/address")}
                        className="w-fit mx-auto text-[#FF583A] text-sm font-medium py-2 px-4 rounded-[12px] transition-all cursor-pointer active:scale-95"
                      >
                        <PlusIcon className="w-2 h-2 mr-2" />
                        Add Address
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      {/* Outlet Delivery Address Selection Drawer */}
      {orderType === "delivery" &&
        outletDetails?.outdetails?.allowCustomDeliveryLocation === true && (
          <>
            {selectedOutletDeliveryAddress ? (
              <div className="w-full bg-white rounded-[12px] shadow p-4 flex flex-col gap-2 border border-gray-100 mb-4">
                <div className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="w-5 h-5 text-[#FF583A]" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {selectedOutletDeliveryAddress.label}
                    </div>
                    <div className="text-xs text-gray-700">
                      {selectedOutletDeliveryAddress.address}
                      <br />
                      {selectedOutletDeliveryAddress.locality
                        ? `${selectedOutletDeliveryAddress.locality}, `
                        : ""}
                      {selectedOutletDeliveryAddress.city},{" "}
                      {selectedOutletDeliveryAddress.state} -{" "}
                      {selectedOutletDeliveryAddress.pincode}
                      <br />
                      {selectedOutletDeliveryAddress.country}
                    </div>
                    {selectedOutletDeliveryAddress.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedOutletDeliveryAddress.notes}
                      </div>
                    )}
                  </div>
                  <button
                    className="ml-auto text-[#FF583A] text-xs underline cursor-pointer active:scale-95 transition-all"
                    onClick={() => setShowOutletAddressModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="w-full bg-white rounded-[12px] shadow p-4 flex items-center gap-2 border border-gray-100 mb-4"
                onClick={() => setShowOutletAddressModal(true)}
              >
                <MapPin className="w-5 h-5 text-[#FF583A]" />
                <span className="text-sm font-semibold text-gray-800 cursor-pointer active:scale-95 transition-transform duration-200">
                  Select Delivery Address
                </span>
              </button>
            )}

            {/* Drawer/Modal for outlet delivery address selection */}
            {showOutletAddressModal && (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              >
                <div className="bg-white rounded-t-lg shadow-lg w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer active:scale-95"
                    onClick={() => setShowOutletAddressModal(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold mb-4">
                    Select Delivery Address
                  </h2>
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                    {outletDeliveryAddresses.length === 0 && (
                      <div className="text-gray-500 text-center">
                        No delivery addresses found.
                      </div>
                    )}
                    {outletDeliveryAddresses.map((address) => {
                      const isSelected =
                        selectedOutletDeliveryAddress &&
                        selectedOutletDeliveryAddress.outlet_delivery_address_id ===
                          address.outlet_delivery_address_id;
                      return (
                        <button
                          key={address.outlet_delivery_address_id}
                          className={`w-full text-left bg-white rounded-[12px] shadow p-4 flex flex-col gap-2 border transition-all cursor-pointer active:scale-95
                          ${
                            isSelected
                              ? "border-[#FF583A] ring-2 ring-[#FF583A]/30"
                              : "border-gray-100 hover:border-[#FF583A]"
                          }
                        `}
                          onClick={() => {
                            setSelectedOutletDeliveryAddress(address);
                            setShowOutletAddressModal(false);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-[#FF583A]" />
                              <span className="text-sm font-semibold text-gray-800">
                                {address.label}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="text-[#FF583A] font-bold text-xs">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 leading-snug">
                            <div>{address.address}</div>
                            <div>
                              {address.locality ? `${address.locality}, ` : ""}
                              {address.city}, {address.state} - {address.pincode}
                            </div>
                            <div>{address.country}</div>
                          </div>
                          {address.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Notes:</span>{" "}
                              {address.notes}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      {/* Cart Items */}
      <CartItems
        items={items}
        handleRemoveAll={handleRemoveAll}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleDecreaseQuantity={handleDecreaseQuantity}
        formatCurrency={formatCurrency}
        calculateItemTotal={calculateItemTotal}
      />

      {/* Schedule Selection */}
      <ScheduleSelection
        scheduleType={scheduleType}
        setScheduleType={setScheduleType}
        handleScheduleLater={handleScheduleLater}
        getFormattedScheduleTime={getFormattedScheduleTime}
        outletDetails={outletDetails}
      />

      {/* Additional Instructions */}
      <AdditionalInstructions
        instruction={instruction}
        setInstruction={setInstruction}
      />

      {/* Payment Mode */}
      <PaymentMode
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        priceBreakdown={priceBreakdown}
        walletBalance={walletBalance}
        formatCurrency={formatCurrency}
      />

      {/* Order Summary */}
      <OrderSummary
        subtotal={subtotal}
        priceBreakdown={priceBreakdown}
        loadingPrices={loadingPrices}
        formatCurrency={formatCurrency}
        items={items}
      />

      {/* Continue Button */}
      <ContinueButton
        isOutletOpen={isOutletOpen}
        paymentMode={paymentMode}
        orderType={orderType}
        priceBreakdown={priceBreakdown}
        customerAuthUID={customerAuthId}
        outletId={outletId}
        deliveryAddress={deliveryAddress}
        instruction={instruction}
        scheduleType={scheduleType}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      {/* Schedule Modal - Conditional rendering based on outlet type */}
      {outletDetails?.outdetails?.hasMess ? (
        <MessScheduleModal
          showScheduleModal={showScheduleModal}
          setShowScheduleModal={setShowScheduleModal}
          handleConfirmSchedule={handleConfirmMessSchedule}
          outletDetails={outletDetails}
        />
      ) : (
        <ScheduleModal
          showScheduleModal={showScheduleModal}
          setShowScheduleModal={setShowScheduleModal}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          scheduleError={scheduleError}
          getFormattedDate={getFormattedDate}
          handleConfirmSchedule={handleConfirmSchedule}
          outletDetails={outletDetails}
        />
      )}
    </div>
  );
};

export default Cart;
