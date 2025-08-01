import React from "react";
import { useNavigate } from "react-router-dom";
import dummyRestaurant from "../../assets/1.png";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!restaurant.is_published) {
      return;
    }
    navigate(
      restaurant.hasMess && restaurant.isWhitelisted
        ? `/mess/${restaurant.outletid}`
        : `/outlet/${restaurant.outletid}`
    );
  };

  // Function to render service types with bullet separators
  const renderServiceTypes = () => {
    const services = [];
    if (restaurant.isdinein) services.push("Dine In");
    if (restaurant.ispickup) services.push("Pickup");
    if (restaurant.isdelivery) services.push("Delivery");
    
    return services.join(" • ");
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-[12px] border ${
        restaurant.hasMess
          ? "border-[#FF583A]/30"
          : "border-gray-200"
      } overflow-hidden hover:${
        restaurant.hasMess ? "border-[#FF583A]" : "border-gray-300"
      } transition-all duration-300 relative ${
        !restaurant.is_published
          ? "opacity-80 cursor-not-allowed"
          : "cursor-pointer"
      } transform w-full active:scale-95 transition-transform duration-200 hover:shadow-md ${
        restaurant.hasMess ? "hover:shadow-[#FF583A]/10" : ""
      }`}
    >
      <div className="relative">
        {/* Restaurant Header Image */}
        <img
          src={restaurant.headerimage || dummyRestaurant}
          alt={restaurant.outlet_name}
          className={`w-full h-40 object-cover ${
            restaurant.hasMess
              ? "border-b-2 border-[#FF583A]/20"
              : ""
          }`}
          onError={(e) => {
            e.target.src = dummyRestaurant;
          }}
        />

        {/* Mess Tag on right-top */}
        {restaurant.hasMess && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FF583A] to-[#FF7A54] text-white px-3 py-1.5 rounded-bl-[12px] text-sm font-medium shadow-md backdrop-blur-sm border-l border-b border-white/20 flex items-center gap-1 transform hover:scale-105 transition-all duration-300">
            Mess
          </div>
        )}

        {/* Restaurant Logo */}
        {restaurant.logo && (
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <img
              src={restaurant.logo}
              alt="logo"
              className={`w-16 h-16 rounded-xl object-cover border-2 ${
                restaurant.hasMess
                  ? "border-[#FFF1EE]"
                  : "border-white"
              } shadow-lg`}
              onError={(e) => {
                e.target.src = dummyRestaurant;
              }}
            />
          </div>
        )}

        {/* Rating Badge */}
        {restaurant.avrage_rating && (
          <div className="absolute bottom-2 right-3 flex items-center bg-white px-2 py-1 rounded-full shadow-md">
            <span className="text-green-700 font-medium mr-1 text-sm">
              {restaurant.avrage_rating}
            </span>
            <svg
              className="w-4 h-4 text-green-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Coming Soon Banner */}
        {!restaurant.is_published && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-[#FF583A] md:text-xl text-lg font-bold px-4 py-2 bg-[#FFF1EE] rounded-[12px] backdrop-blur-sm bg-opacity-10">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div
        className={`p-5 ${restaurant.logo ? "pt-8" : "pt-5"} ${
          restaurant.hasMess ? "bg-[#FFF1EE]/10" : ""
        }`}
      >
        {/* Restaurant Name */}
        <div className="flex items-start justify-between mb-2">
          <h3
            className={`font-semibold text-lg md:text-base ${
              restaurant.logo ? "mt-3" : ""
            } line-clamp-1 ${
              restaurant.hasMess
                ? "text-[#FF583A]"
                : "text-gray-800"
            }`}
          >
            {restaurant.outlet_name}
          </h3>
          {!restaurant.avrage_rating && (
            <div className="text-sm text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full ml-1 whitespace-nowrap">
              New
            </div>
          )}
        </div>

        {/* Restaurant Address */}
        {restaurant.address && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-1 flex items-center">
            <svg
              className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{restaurant.address}</span>
          </p>
        )}

        {/* Service Types */}
        {(restaurant.isdinein || restaurant.ispickup || restaurant.isdelivery) && (
          <p className="text-gray-600 text-sm mb-1 font-medium">
            {renderServiceTypes()}
          </p>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard; 