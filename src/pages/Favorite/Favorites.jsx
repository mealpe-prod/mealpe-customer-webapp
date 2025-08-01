import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Toast from "../../components/Toast";

const Favorites = () => {
  const {user} = useSelector(state => state.auth);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingFavorites, setRemovingFavorites] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [user?.customerAuthUID]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      if (!user?.customerAuthUID) {
        Toast.error('Please login to view favorites');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}favorite/favorite/getfavoriteMenuItem/${user?.customerAuthUID}`,
      );

      if (response.data.success) {
        setFavorites(response.data.data);
      } else {
        Toast.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Toast.error('Something went wrong while fetching favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteMenuItemId) => {
    try {
      setRemovingFavorites(prev => ({ ...prev, [favoriteMenuItemId]: true }));
      if (!user?.customerAuthUID) {
        Toast.error('Please login to remove favorites');
        return;
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}favorite/favorite/deleteFavoriteMenuItem/${favoriteMenuItemId}`,
      );

      if (response.data.success) {
        Toast.success('Removed from favorites');
        setFavorites(favorites.filter(item => item.favoriteMenuItemId !== favoriteMenuItemId));
      } else {
        Toast.error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      Toast.error('Something went wrong while removing favorite');
    } finally {
      setRemovingFavorites(prev => ({ ...prev, [favoriteMenuItemId]: false }));
    }
  };

  const EmptyFavorites = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-40">
      <div className="w-[120px] h-[120px] rounded-lg shadow-md flex items-center justify-center mb-6">
        <FavoriteBorderIcon style={{ fontSize: '48px', color: '#FF583A' }} />
      </div>
      <h2 className="text-xl font-semibold text-center text-[#1A1A1A]">No Favourites!</h2>
      <p className="text-gray-500 text-center text-sm max-w-md">
        Don't worry, it's easy to get started! Our restaurant page is brimming with delightful options.
      </p>
    </div>
  );

  const FavoriteSkeleton = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden shadow flex animate-pulse">
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="mt-auto">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="relative w-1/3 m-2">
          <div className="w-full h-full bg-gray-200 rounded-lg" style={{ minHeight: '120px' }}></div>
          <div className="absolute top-2 right-2 bg-gray-300 w-8 h-8 rounded-lg"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white w-full shadow-sm z-50">
        <button 
          onClick={() => navigate("/home")} 
          className="p-1 rounded-lg cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Favourites List</h1>
      </div>
      
      {loading ? (
        <div className="px-4 space-y-4 mt-4">
          <FavoriteSkeleton />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-4">
          {favorites.map((favorite) => (
            <div key={favorite.favoriteMenuItemId} className="bg-white rounded-[12px] overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col h-full">
              <div className="relative h-40">
                {favorite.itemid.item_image_url ? (
                  <img 
                    src={favorite.itemid.item_image_url} 
                    alt={favorite.itemid.itemname} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FFF1EE]">
                    <span className="text-[#FF583A] font-medium">No Image</span>
                  </div>
                )}
                <button 
                  onClick={() => handleRemoveFavorite(favorite.favoriteMenuItemId)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer active:scale-95 transition-transform duration-200 z-10"
                  aria-label="Remove from favorites"
                  disabled={removingFavorites[favorite.favoriteMenuItemId]}
                >
                  {removingFavorites[favorite.favoriteMenuItemId] ? (
                    <div className="w-4 h-4 border-2 border-t-2 border-[#FF583A] rounded-full animate-spin"></div>
                  ) : (
                    <FavoriteIcon className="text-[#FF583A]" fontSize="small" />
                  )}
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{favorite.itemid.itemname}</h3>
                  
                  {favorite.itemid.outletId?.outletName && (
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="line-clamp-1">{favorite.itemid.outletId.outletName}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex justify-between items-center">
                  {favorite.itemid.price && (
                    <span className="text-[#FF583A] font-bold">₹{favorite.itemid.price.toFixed(2)}</span>
                  )}
                  
                  {/* <button 
                    onClick={() => navigate(`/outlet/${favorite.itemid.outletId.outletId}/${favorite.itemid.itemid}`)}
                    className="px-3 py-1 bg-[#FF583A] text-white rounded-[12px] cursor-pointer text-sm font-medium active:scale-95 transition-transform duration-200"
                  >
                    View
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites; 