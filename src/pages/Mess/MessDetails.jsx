import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import QrCodeIcon from "@mui/icons-material/QrCode";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";
import { QRCodeSVG } from "qrcode.react";
import { useSocket } from "../../hooks/useSocket";
import {
  MessDaySkeleton,
  MessProfileSkeleton,
} from "../../components/SkeletonLoader";
import ResetDeviceTime from "./ResetDeviceTime";

const MessDetails = () => {
  const [messMenuData, setMessMenuData] = useState({
    today: [],
    tomorrow: [],
  });
  const [messDetails, setMessDetails] = useState(null);
  const [outletDetails, setOutletDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentDayInfo, setCurrentDayInfo] = useState({
    today: "",
    tomorrow: "",
  });
  const [disabled, setDisabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const { connectSocket, disconnectSocket, qrCodeData } = useSocket();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { outletId } = useParams();
  const customerAuthId = user?.customerAuthUID;

  // Check if RSVP deadline has passed
  const isRsvpDeadlinePassed = (meal) => {
    if (!meal.rsvpDeadline) return false;

    const now = new Date();
    const deadline = new Date(meal.rsvpDeadline);

    // Extract hours and minutes
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    const deadlineHours = deadline.getHours();
    const deadlineMinutes = deadline.getMinutes();

    // Compare time only
    if (nowHours > deadlineHours) return true;
    if (nowHours === deadlineHours && nowMinutes > deadlineMinutes) return true;

    return false;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await getOutletDetails();
        await fetchRestaurants();
        if (customerAuthId) {
          await fetchMessMenu();
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, outletId, customerAuthId]);

  useEffect(() => {
    if (messDetails?.isWhitelisted === false) {
      navigate("/outlet/" + outletId);
    }
  }, [messDetails]);

  const getOutletDetails = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/cafeteriaDetails/${outletId}/${customerAuthId}`
      );
      if (response.data.success) {
        setOutletDetails(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getOutletList/${
          user?.campusId?.campusId
        }?cuid=${user?.customerAuthUID}`
      );
      // console.log(response);

      if (response.data.success) {
        setMessDetails(
          response.data.data.find((item) => item.outletid == outletId)
        );
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Format time from API to display in 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get day names dynamically
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayDayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const tomorrowDayName = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
    });

    setCurrentDayInfo({
      today: todayDayName,
      tomorrow: tomorrowDayName,
    });
  }, []);

  // Format date for display (e.g., "05 Jun 2025")
  const formatDate = (dayType) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const date = dayType === "tomorrow" ? tomorrow : today;

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const fetchMessMenu = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }mess/weeklyMenu/getMessMenu/${outletId}?cuid=${customerAuthId}`
      );

      if (response.data && response.data.success) {
        setMessMenuData(response.data);
      } else {
        Toast.error("Failed to load mess menu");
      }
    } catch (error) {
      console.error("Error fetching mess menu:", error);
      Toast.error("Error loading mess menu");
    }
  };

  useEffect(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const meals =
      messMenuData?.today?.map((meal) => {
        const start = new Date(meal.startTime);
        const end = new Date(meal.endTime);
        return {
          ...meal,
          startMinutes: start.getHours() * 60 + start.getMinutes(),
          endMinutes: end.getHours() * 60 + end.getMinutes(),
        };
      }) || [];

    const currentMeal = meals.find(
      (meal) => nowMinutes >= meal.startMinutes && nowMinutes < meal.endMinutes
    );

    if (currentMeal) {
      if (!currentMeal.isChoice) {
        setDisabled(true);
        setStatusMessage(
          `You have not opted for ${currentMeal.mealTypeId}. Please contact mess admin in case of an exception.`
        );
      } else {
        setDisabled(false);
        setStatusMessage(null);
      }
      return;
    }

    // Check if any meal deadline has passed for today but not served yet
    const passedDeadlineMeal = meals.find((meal) => {
      if (!meal.rsvpDeadline) return false;

      const deadline = new Date(meal.rsvpDeadline);
      const deadlineHours = deadline.getHours();
      const deadlineMinutes = deadline.getMinutes();

      // Compare time only
      const deadlinePassed =
        now.getHours() > deadlineHours ||
        (now.getHours() === deadlineHours &&
          now.getMinutes() > deadlineMinutes);

      return nowMinutes < meal.startMinutes && deadlinePassed && !meal.isChoice;
    });

    if (passedDeadlineMeal) {
      setDisabled(true);
      setStatusMessage(
        `You missed the deadline to opt for ${passedDeadlineMeal.mealTypeId}. Please contact mess admin in case of an exception.`
      );
      return;
    }

    const upcomingMeal = meals.find(
      (meal) => nowMinutes < meal.startMinutes && meal.isChoice
    );

    if (upcomingMeal) {
      setDisabled(true);
      setStatusMessage(
        `There is still time to opt for ${upcomingMeal.mealTypeId}.`
      );
    } else {
      // If no current, passed deadline, or upcoming meals are found
      const anyCurrentOrUpcomingMeal = meals.find(
        (meal) => nowMinutes < meal.endMinutes
      );

      if (anyCurrentOrUpcomingMeal) {
        setDisabled(true);
        setStatusMessage(`No opted meals available at this time.`);
      } else {
        setDisabled(false);
        setStatusMessage(null);
      }
    }
  }, [messMenuData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    await fetchMessMenu();
    setRefreshing(false);
    setLoading(false);
  };

  // Handle RSVP submission
  const handleRsvp = async (meal, response, isTomorrow) => {
    try {
      setSubmittingRsvp(true);

      // Check if deadline has passed for today's meals
      if (!isTomorrow && isRsvpDeadlinePassed(meal)) {
        Toast.error("RSVP deadline has passed for this meal");
        return;
      }

      const payload = {
        customerAuthUID: customerAuthId,
        response: response, // true for Yes, false for No
        menuId: meal.menuId,
        isTomorrow: isTomorrow,
        outletId: outletId,
        mealTypeId: meal.mealTypeId,
      };

      const result = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}mess/rsvp`,
        payload
      );

      if (result.data && result.data.success) {
        Toast.success(`Meal ${response ? "booked" : "declined"} successfully`);
        // Refresh menu data to show updated status
        fetchMessMenu();
      } else {
        Toast.error(result.data?.message || "Failed to update meal preference");
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      Toast.error(
        error.response?.data?.message || "Failed to update meal preference"
      );
    } finally {
      setSubmittingRsvp(false);
    }
  };

  // Handle Yes To All
  const handleYesToAll = async (dayData, isTomorrow) => {
    try {
      setSubmittingRsvp(true);

      // Process each meal in sequence
      for (const meal of dayData) {
        // Skip meals with passed deadlines for today
        if (!isTomorrow && isRsvpDeadlinePassed(meal)) {
          continue;
        }

        const payload = {
          customerAuthUID: customerAuthId,
          response: true, // Yes for all
          menuId: meal.menuId,
          isTomorrow: isTomorrow,
          outletId: outletId,
          mealTypeId: meal.mealTypeId,
        };

        await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}mess/rsvp`,
          payload
        );
      }

      Toast.success("All meals booked successfully");
      // Refresh menu data to show updated status
      fetchMessMenu();
    } catch (error) {
      console.error("Error submitting Yes To All:", error);
      Toast.error(error.response?.data?.message || "Failed to book all meals");
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const renderMealChoice = (meal, isTomorrow) => {
    const isPastDeadline = !isTomorrow && isRsvpDeadlinePassed(meal);
    const isButtonDisabled = submittingRsvp || isPastDeadline;

    // Check if user has already made a choice
    const hasChoice = meal.isChoice !== undefined;
    const userSelectedYes = hasChoice && meal.isChoice === true;
    const userSelectedNo = hasChoice && meal.isChoice === false;

    return (
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={async () => {
            if (!userSelectedYes) {
              try {
                // Fetch server time
                const serverTimeRes = await axios.get(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}getTime`);
                if (!serverTimeRes?.data) {
                  console.error("Unable to verify device time. Please try again.");
                  return;
                }
                // Extract server time
                const { year, month, day, hour, minute } = serverTimeRes.data;
                const serverDate = new Date(year, month - 1, day, hour, minute);

                // Get device time
                const deviceDate = new Date();
                // Compare year, month, day, hour, minute
                const isTimeMatch =
                  serverDate.getFullYear() === deviceDate.getFullYear() &&
                  serverDate.getMonth() === deviceDate.getMonth() &&
                  serverDate.getDate() === deviceDate.getDate() &&
                  serverDate.getHours() === deviceDate.getHours() &&
                  serverDate.getMinutes() === deviceDate.getMinutes();

                // Allow a 2-minute difference for minor clock drift
                const diffMs = Math.abs(serverDate.getTime() - deviceDate.getTime());
                const diffMinutes = diffMs / (1000 * 60);

                if (!isTimeMatch && diffMinutes > 2) {
                  // Device time mismatch, navigate to reset screen
                  navigate("/device-time");
                  return;
                }

                // If time matches, proceed
                handleRsvp(meal, true, isTomorrow);
              } catch (error) {
                console.error("Error verifying device time:", error);
              }
            }
          }}
          disabled={
            isPastDeadline
              ? true // Not changeable after deadline
              : isButtonDisabled
          }
          className={`rounded-[12px] cursor-pointer px-6 py-2.5 text-sm font-medium active:scale-95 transition-transform duration-200 ${
            userSelectedYes
              ? "bg-green-50 text-green-700 border border-green-300 font-medium"
              : isPastDeadline
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              : "border border-gray-200"
          }`}
        >
          Yes
        </button>
        <button
          onClick={async () => {
            if (!userSelectedNo) {
              try {
                // Fetch server time
                const serverTimeRes = await axios.get(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}getTime`);
                if (!serverTimeRes?.data) {
                  console.error("Unable to verify device time. Please try again.");
                  return;
                }
                // Extract server time
                const { year, month, day, hour, minute } = serverTimeRes.data;
                const serverDate = new Date(year, month - 1, day, hour, minute);

                // Get device time
                const deviceDate = new Date();
                // Compare year, month, day, hour, minute
                const isTimeMatch =
                  serverDate.getFullYear() === deviceDate.getFullYear() &&
                  serverDate.getMonth() === deviceDate.getMonth() &&
                  serverDate.getDate() === deviceDate.getDate() &&
                  serverDate.getHours() === deviceDate.getHours() &&
                  serverDate.getMinutes() === deviceDate.getMinutes();

                // Allow a 2-minute difference for minor clock drift
                const diffMs = Math.abs(serverDate.getTime() - deviceDate.getTime());
                const diffMinutes = diffMs / (1000 * 60);

                if (!isTimeMatch && diffMinutes > 2) {
                  // Device time mismatch, navigate to reset screen
                  navigate("/device-time");
                  return;
                }

                // If time matches, proceed
                handleRsvp(meal, false, isTomorrow);
              } catch (error) {
                console.error("Error verifying device time:", error);
              }
            }
          }}
          disabled={
            isPastDeadline
              ? true // Not changeable after deadline
              : isButtonDisabled
          }
          className={`rounded-[12px] cursor-pointer px-6 py-2.5 text-sm font-medium active:scale-95 transition-transform duration-200 ${
            userSelectedNo
              ? "bg-red-50 text-red-600 border border-red-300 font-medium"
              : isPastDeadline
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              : "border border-gray-200"
          }`}
        >
          No
        </button>
      </div>
    );
  };

  // Generate QR code data string
  const generateQrData = (menuId) => {
    if (!menuId || !customerAuthId) return "";
    return `${menuId}===${customerAuthId}`;
  };

  // Show QR code for a specific meal
  const handleShowQRCode = (meal) => {
    // Check if meal is opted for
    if (!meal.isChoice) {
      Toast.error(`You have not opted for ${meal.mealTypeId}`);
      return;
    }

    // Check if the deadline has passed for today's meal
    const now = new Date();
    if (!meal.isTomorrow && meal.rsvpDeadline) {
      const deadline = new Date(meal.rsvpDeadline);
      const isPastDeadline =
        now.getHours() > deadline.getHours() ||
        (now.getHours() === deadline.getHours() &&
          now.getMinutes() > deadline.getMinutes());

      if (isPastDeadline) {
        Toast.error("RSVP deadline has passed for this meal");
        return;
      }
    }

    setSelectedMeal(meal);
    setShowQRCode(true);
  };

  // Render each meal section
  const renderMealSection = (meal, isTomorrow) => {
    const rsvpDeadline = meal.rsvpDeadline ? formatTime(meal.rsvpDeadline) : "";
    const isPastDeadline = !isTomorrow && isRsvpDeadlinePassed(meal);

    return (
      <div
        key={meal.menuId}
        className={`flex gap-2 justify-between items-center border-b py-2 border-gray-100 rounded-lg transition-opacity duration-300 ${
          isPastDeadline
            ? "opacity-50 bg-gray-50 cursor-not-allowed"
            : "bg-white"
        }`}
      >
        <div className="w-[55%]">
          <h3 className="text-md font-semibold text-gray-800 mb-1.5">
            {meal.mealTypeId}
          </h3>
          <p className="text-sm text-gray-600 mb-1 break-words whitespace-pre-line">
            {meal.menuDescription}
          </p>
          <p className="text-xs text-gray-500 mb-3">RSVP by: {rsvpDeadline}</p>

          {isPastDeadline && (
            <p className="text-xs text-red-500 mb-2 font-medium">
              RSVP deadline has passed
            </p>
          )}
        </div>

        {/* Optionally disable choices */}
        <div className="flex items-center">
          <div className={isPastDeadline ? "pointer-events-none mr-2" : "mr-2"}>
            {renderMealChoice(meal, isTomorrow)}
          </div>
        </div>
      </div>
    );
  };

  const renderDaySection = (dayData, dayType) => {
    if (!dayData || dayData.length === 0) return null;

    const dayName =
      dayType === "tomorrow" ? currentDayInfo.tomorrow : currentDayInfo.today;
    const isTomorrow = dayType === "tomorrow";

    // Check if all meals for today have passed their deadline
    const allMealsPastDeadline =
      !isTomorrow && dayData.every((meal) => isRsvpDeadlinePassed(meal));

    return (
      <div className="mb-6 bg-white rounded-lg p-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base text-gray-500">{dayName}</h2>
          </div>
          <p className="text-xs text-gray-400">{formatDate(dayType)}</p>
          <button
            onClick={() => handleYesToAll(dayData, isTomorrow)}
            disabled={submittingRsvp || allMealsPastDeadline}
            className={`text-sm font-medium hover:underline active:scale-95 transition-transform duration-200 ${
              submittingRsvp || allMealsPastDeadline
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#FF583A]"
            }`}
          >
            Yes To All
          </button>
        </div>

        {dayData.map((meal) => renderMealSection(meal, isTomorrow))}
      </div>
    );
  };

  // Handle socket connection when QR code modal is open
  useEffect(() => {
    if (showQRCode && customerAuthId) {
      connectSocket(customerAuthId);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [showQRCode, customerAuthId]);

  // Handle qrCodeData updates
  useEffect(() => {
    if (qrCodeData) {
      try {
        if (
          qrCodeData?.success === true &&
          qrCodeData?.message === "Meal Served Successfully"
        ) {
          Toast.success("Meal served successfully.");
          // Add vibration if browser supports it
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          setShowQRCode(false);
        } else if (
          qrCodeData?.success === false &&
          qrCodeData?.message === "Meal already served"
        ) {
          Toast.warning("Meal already served.");
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
          setShowQRCode(false);
        }
      } catch (error) {
        console.error("Error handling QR code data:", error);
      }
    }
  }, [qrCodeData]);

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-lg hover:cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Mess Details</h1>
        <button
          onClick={handleRefresh}
          className={`p-1 rounded-lg hover:cursor-pointer active:scale-95 transition-transform duration-200 ${
            refreshing ? "animate-spin" : ""
          }`}
        >
          <RefreshIcon className="text-xl" />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {/* Mess Profile */}
        {loading ? (
          <MessProfileSkeleton />
        ) : (
          <div className="flex flex-col p-1 bg-white rounded-lg">
            <div className="flex items-center self-start">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF583A] rounded-full flex items-center justify-center text-white text-lg md:text-xl mr-4">
                {outletDetails?.outdetails?.outletName?.charAt(0) || ""}
              </div>
              <h2 className="text-lg md:text-xl font-medium text-gray-800">
                {outletDetails?.outdetails?.outletName || "Loading..."}
              </h2>
            </div>
            <div className="flex justify-center w-full mt-4 md:mt-0">
              <button
                onClick={() => {
                  // Find first current meal
                  const currentMeall = [
                    ...(messMenuData.today || []),
                    ...(messMenuData.tomorrow || []),
                  ].find(
                    (meal) => meal.isCurrent === true && meal.isChoice === true
                  );

                  if (!currentMeall) {
                    Toast.error("You have not opted for any current meal");
                    return;
                  }

                  setSelectedMeal(currentMeall);
                  setShowQRCode(true);
                }}
                disabled={disabled}
                className={`bg-[#FF583A] text-white px-3 py-3 rounded-[12px] flex items-center text-sm transition-all duration-300 hover:bg-[#e64d33] active:scale-95 ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <span className="mr-1.5">Display QR Code</span>
                <QrCodeIcon fontSize="small" />
              </button>
            </div>
            {statusMessage && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {statusMessage}
              </p>
            )}
          </div>
        )}

        {/* Menu Sections */}
        {loading ? (
          <div className="space-y-4">
            <MessDaySkeleton />
            <MessDaySkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {renderDaySection(messMenuData.today, "today")}
            {renderDaySection(messMenuData.tomorrow, "tomorrow")}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <div className="bg-white p-5 rounded-2xl w-10/12 max-w-sm relative shadow-2xl border border-gray-100 animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => setShowQRCode(false)}
              className="absolute text-gray-500 hover:text-gray-800 right-4 top-3 hover:cursor-pointer active:scale-95 transition-transform duration-200 bg-gray-100 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ×
            </button>

            <div className="flex flex-col items-center justify-center mb-2 rounded-xl p-4">
              {selectedMeal ? (
                selectedMeal.isChoice === true ? (
                  <>
                    <div className="flex items-center mb-4 bg-[#FF583A] text-white px-4 py-2 rounded-[12px] shadow-md">
                      <p className="text-sm font-medium">
                        {selectedMeal.mealTypeId}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <QRCodeSVG
                        value={generateQrData(selectedMeal.menuId)}
                        size={180}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-3 text-center">
                      Scan to access your meal
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-500 font-medium mb-2">Not Opted</p>
                    <p className="text-gray-600 text-sm">
                      You have not opted for {selectedMeal.mealTypeId}. Please
                      contact mess admin in case of an exception.
                    </p>
                  </div>
                )
              ) : (
                <p className="text-gray-500 text-sm py-6">No meal selected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessDetails;
