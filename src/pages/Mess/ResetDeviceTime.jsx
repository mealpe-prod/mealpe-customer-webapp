import React from "react";
import { useNavigate } from "react-router-dom";

// Constants for styling and time info
const TIME_ILLUSTRATION =
  "https://cdn-icons-png.flaticon.com/512/3062/3062634.png"; // Example clock illustration

/**
 * ResetDeviceTimeScreen
 * A beautiful, accessible screen prompting the user to reset their device time.
 * Shows a clock illustration, current device time, and clear instructions.
 */
const ResetDeviceTime = () => {
    const navigate = useNavigate();
  // Get current device time
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Handler for "How to reset" (could open a help modal or link)
  const handleHowToReset = () => {
   navigate(-1);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5F3] to-[#FFE5E0] px-4"
      aria-label="Reset Device Time Screen"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center border border-[#FFD2C7]">
        {/* Clock Illustration */}
        <img
          src={TIME_ILLUSTRATION}
          alt="Clock illustration"
          className="w-28 h-28 mb-6 animate-pulse"
          style={{ filter: "drop-shadow(0 2px 8px rgba(255,88,58,0.10))" }}
        />

        {/* Main Heading */}
        <h1 className="text-2xl font-bold text-[#FF583A] mb-2 text-center">
          Please Reset Your Device Time
        </h1>

        {/* Subheading */}
        <p className="text-gray-700 text-center mb-4">
          It looks like your device time is incorrect. <br />
          For security and proper functioning, please set your device's date and time to automatic.
        </p>

        {/* Current Device Time */}
        <div className="bg-[#FFF0EC] rounded-lg px-4 py-2 mb-4 flex flex-col items-center border border-[#FFD2C7]">
          <span className="text-xs text-gray-500">Your current device time:</span>
          <span className="font-mono text-lg text-[#FF583A] font-semibold">
            {formattedTime}
          </span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>

        {/* Instructions */}
        <ul className="text-sm text-gray-700 mb-4 list-disc list-inside text-left w-full max-w-xs">
          <li>
            Go to your device's <b>Settings</b>.
          </li>
          <li>
            Find <b>Date &amp; Time</b> settings.
          </li>
          <li>
            Enable <b>Automatic date &amp; time</b> (use network-provided time).
          </li>
          <li>
            Restart this app after correcting the time.
          </li>
        </ul>

        {/* Help Button */}
        <button
          onClick={handleHowToReset}
          className="mt-2 px-5 py-2 bg-[#FF583A] text-white rounded-lg font-medium shadow hover:bg-[#e64d33] active:scale-95 transition-all"
          aria-label="How to reset device time"
        >
         Go Back
        </button>
      </div>

      {/* Accessibility: visually hidden live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        Your current device time is {formattedTime} on {formattedDate}.
      </div>
    </div>
  );
};

export default ResetDeviceTime;
