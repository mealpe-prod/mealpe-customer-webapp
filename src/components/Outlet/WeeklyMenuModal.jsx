import React, { useState, useEffect } from "react";

const WeeklyMenuModal = ({ 
  isOpen, 
  onClose, 
  outletId, 
  weeklyMenu, 
  availableMealTypes, 
  loading, 
  error 
}) => {
  const [activeDay, setActiveDay] = useState(null);

  // Set active day when modal opens or when weeklyMenu changes
  useEffect(() => {
    if (isOpen && weeklyMenu) {
      // Set active day to the current day or first available day
      const today = new Date();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDay = dayNames[today.getDay()];
      setActiveDay(currentDay);
    }
  }, [isOpen, weeklyMenu]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get all days of the week in correct order
  const getAllDays = () => {
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  };

  // Get the abbreviated day name
  const getAbbreviatedDay = (day) => {
    const abbreviations = {
      Monday: "MON",
      Tuesday: "TUE",
      Wednesday: "WED",
      Thursday: "THU",
      Friday: "FRI",
      Saturday: "SAT",
      Sunday: "SUN",
    };
    return abbreviations[day] || day.substring(0, 3).toUpperCase();
  };

  // Get menu for the active day
  const getDayMenu = (day) => {
    if (!weeklyMenu || !weeklyMenu.fullWeekMenu) return null;

    const menu = {};

    // Only add meal types that are available
    if (
      weeklyMenu.fullWeekMenu.Breakfast &&
      weeklyMenu.fullWeekMenu.Breakfast.length > 0
    ) {
      menu.Breakfast = "Not available";
      const breakfastItem = weeklyMenu.fullWeekMenu.Breakfast.find(
        (item) => Object.keys(item)[0] === day
      );
      if (breakfastItem) {
        menu.Breakfast = breakfastItem[day];
      }
    }

    if (
      weeklyMenu.fullWeekMenu.Lunch &&
      weeklyMenu.fullWeekMenu.Lunch.length > 0
    ) {
      menu.Lunch = "Not available";
      const lunchItem = weeklyMenu.fullWeekMenu.Lunch.find(
        (item) => Object.keys(item)[0] === day
      );
      if (lunchItem) {
        menu.Lunch = lunchItem[day];
      }
    }

    if (
      weeklyMenu.fullWeekMenu.HighTea &&
      weeklyMenu.fullWeekMenu.HighTea.length > 0
    ) {
      menu.HighTea = "Not available";
      const highTeaItem = weeklyMenu.fullWeekMenu.HighTea.find(
        (item) => Object.keys(item)[0] === day
      );
      if (highTeaItem) {
        menu.HighTea = highTeaItem[day];
      }
    }

    if (
      weeklyMenu.fullWeekMenu.Dinner &&
      weeklyMenu.fullWeekMenu.Dinner.length > 0
    ) {
      menu.Dinner = "Not available";
      const dinnerItem = weeklyMenu.fullWeekMenu.Dinner.find(
        (item) => Object.keys(item)[0] === day
      );
      if (dinnerItem) {
        menu.Dinner = dinnerItem[day];
      }
    }

    return menu;
  };

  const dayMenu = activeDay ? getDayMenu(activeDay) : null;
  const allDays = getAllDays();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-h-[80vh] sm:max-w-md mx-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Menu List</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading menu...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Day tabs */}
            <div className="flex overflow-x-auto px-2 py-3 border-b border-gray-200 hide-scrollbar">
              {allDays.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`min-w-[70px] px-3 py-2 mx-1 rounded-full text-center text-sm font-medium transition-colors active:scale-95 cursor-pointer ${
                    activeDay === day
                      ? "bg-[#FF583A] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getAbbreviatedDay(day)}
                </button>
              ))}
            </div>

            {/* Menu content */}
            <div className="flex-1 overflow-y-auto p-4">
              {dayMenu && (
                <>
                  {availableMealTypes.length > 0 ? (
                    availableMealTypes.map((mealType, index) => (
                      <div
                        key={mealType}
                        className={`mb-${
                          index === availableMealTypes.length - 1 ? 2 : 6
                        }`}
                      >
                        <h4 className="text-md font-bold mb-2">{mealType}</h4>
                        <p className="text-sm text-gray-700">
                          {dayMenu[mealType]}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No menu available for this day
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyMenuModal;
