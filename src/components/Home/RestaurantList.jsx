import React from "react";
import RestaurantCard from "./RestaurantCard";
import RestaurantSkeleton from "./RestaurantSkeleton";
import NoResults from "./NoResults";

const RestaurantList = ({ 
  filteredRestaurants, 
  restaurantsLoading, 
  searchQuery 
}) => {
  if (restaurantsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <RestaurantSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (filteredRestaurants.length === 0) {
    return <NoResults searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRestaurants
        ?.sort((a, b) => Number(a.sequence) - Number(b.sequence))
        ?.filter((restaurant) => {
          if (restaurant.hasMess) {
            // For mess: show if visible to all or if user is whitelisted
            return (
              restaurant.isVisibleToAll ||
              (!restaurant.isVisibleToAll && restaurant.isWhitelisted)
            );
          } else {
            // For non-mess outlets: keep existing behavior
            return restaurant.isVisibleToAll
              ? true
              : !restaurant.isWhitelisted;
          }
        })
        ?.map((restaurant) => (
          <RestaurantCard key={restaurant.outletid} restaurant={restaurant} />
        ))}
    </div>
  );
};

export default RestaurantList; 