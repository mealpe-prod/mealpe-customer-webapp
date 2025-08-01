import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import dummyImage from "../../assets/mealpe.png";
import Toast from "../../components/Toast";
import {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from "../../redux/slices/cartSlice";
import RemoveItemModal from "./RemoveItemModal";
import UnifiedItemModal from "./UnifiedItemModal";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TuneIcon from "@mui/icons-material/Tune";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const MenuItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { outletId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [isFavorite, setIsFavorite] = useState(
    item.isFavoriteMenuItem || false
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItemForRemoval, setSelectedItemForRemoval] = useState(null);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // Filter items with the same itemid and outletId
  const matchingCartItems = cartItems.filter(
    (cartItem) => cartItem.id === item.itemid && cartItem.outletId === outletId
  );

  // Sum quantities of all matching items
  const itemQuantity = matchingCartItems.reduce(
    (total, item) => total + item.qty,
    0
  );

  // For reference to a specific cart item (if needed)
  const cartItem = matchingCartItems.length > 0 ? matchingCartItems[0] : null;

  // Check if item allows customization (variations or addons)
  const hasVariations = item.itemallowvariation === "1";
  const hasAddons = item.itemallowaddon === "1";
  const allowsCustomization = hasVariations || hasAddons;

  // Helper function to get food type indicator details
  const getFoodTypeIndicator = () => {
    try {
      // Check attributeid to determine food type
      if (item.attributeid === 1) {
        return { color: "green", label: "Veg" };
      } else if (item.attributeid === 2) {
        return { color: "red", label: "Non-Veg" };
      } else if (item.attributeid === 3) {
        return { color: "yellow", label: "Egg" };
      } else {
        // Default to veg if attributeid is not defined or has unexpected value
        console.log("Unknown attributeid:", item.attributeid);
        return { color: "green", label: "Veg" };
      }
    } catch (error) {
      console.error("Error determining food type:", error);
      return { color: "green", label: "Veg" };
    }
  };

  const foodType = getFoodTypeIndicator();

  const handleAddClick = () => {
    if (item.isMessItem && itemQuantity >= 1) {
      Toast.info("You can only add 1 quantity of this item");
      return;
    }

    if (item.status) {
      // If the item doesn't allow customization, add it directly to cart
      if (!allowsCustomization) {
        addItemDirectly();
      } else {
        // Otherwise, navigate to the item details page for customization
        navigate(`/outlet/${outletId || item.outletId}/${item.itemid}`);
      }
    }
  };

  // Function to directly add item to cart without customization
  const addItemDirectly = () => {
    try {
      // Check if the current item is a mess item
      if (item.isMessItem) {
        const existingMessItem = cartItems.find(
          (cartItem) => cartItem.isMessItem
        );
        if (existingMessItem) {
          Toast.info("You can only add one mess item at a time");
          return;
        }
      }

      // If the item is already in cart, just increase its quantity
      if (matchingCartItems.length > 0) {
        dispatch(increaseQuantity(matchingCartItems[0]));
        // Toast.success("Item quantity increased");
        return;
      }

      // Construct the simple item object without variations or addons
      const cartItem = {
        id: parseInt(item.itemid),
        name: item.itemname,
        price: item.price,
        outletId: outletId,
        restaurantId: null,
        item_image_url: item.item_image_url,
        minimumpreparationtime: item.minimumpreparationtime,
        extra: [],
        isEdit: false,
        previousItem: null,
        addons: {},
        qty: 1,
        isMessItem: item.isMessItem,
        itemallowvariation: item.itemallowvariation,
        itemallowaddon: item.itemallowaddon,
      };

      dispatch(addToCart(cartItem));
      Toast.success("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Toast.error("Failed to add item to cart");
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (!item.status) return;

    // If there are multiple variations of this item in the cart
    if (matchingCartItems.length > 1 && allowsCustomization) {
      // Show the modal only if the item allows customization
      setShowUnifiedModal(true);
    } else if (cartItem) {
      if (cartItem.qty > 1) {
        dispatch(decreaseQuantity(cartItem));
      } else {
        dispatch(removeFromCart(cartItem));
      }
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (!item.status) return;

    // For mess items, limit quantity to 1
    console.log("itemQuantity", item);
    if (item.isMessItem && itemQuantity >= 1) {
      Toast.info("You can only add 1 quantity of this item");
      return;
    }

    // If the item doesn't allow customization
    if (!allowsCustomization) {
      // Just increase quantity directly without showing the modal
      if (matchingCartItems.length > 0) {
        dispatch(increaseQuantity(matchingCartItems[0]));
        // Toast.success("Item quantity increased");
      } else {
        addItemDirectly();
      }
      return;
    }

    // For items that allow customization
    if (matchingCartItems.length > 0) {
      setShowUnifiedModal(true);
    } else {
      navigate(`/outlet/${outletId || item.outletId}/${item.itemid}`);
    }
  };

  const handleRepeatItem = () => {
    // Choose the first matching item as the template to repeat
    const itemToRepeat = matchingCartItems[0];

    // If the item already exists, increase its quantity
    if (itemToRepeat) {
      dispatch(increaseQuantity(itemToRepeat));
    } else {
      // Add the same item with the same customizations
      dispatch(
        addToCart({
          ...itemToRepeat,
          qty: 1, // Adding one more
        })
      );
    }

    setShowUnifiedModal(false);
  };

  const handleChooseCustomization = () => {
    setShowUnifiedModal(false);
    navigate(`/outlet/${outletId || item.outletId}/${item.itemid}`);
  };

  const handleRemoveItem = (itemToRemove) => {
    try {
      if (itemToRemove.qty > 1) {
        // Decrease quantity of the exact matching item
        dispatch(decreaseQuantity(itemToRemove));
      } else {
        // Remove the exact matching item
        dispatch(removeFromCart(itemToRemove));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      Toast.error("Failed to remove item");
    }

    setShowRemoveModal(false);
    setSelectedItemForRemoval(null);
  };

  const handleFavoriteToggle = async () => {
    // If user is not logged in, show a message
    if (!user || !user.customerAuthUID) {
      Toast.error("Please login to add items to favorites");
      return;
    }

    // Prevent multiple clicks
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      if (!isFavorite) {
        // Add to favorites
        const response = await axios.post(
          `${
            import.meta.env.VITE_APP_BACKEND_BASE_URL
          }favorite/favorite/favoriteMenuItem`,
          {
            customerAuthUID: user.customerAuthUID,
            outletId: outletId,
            itemid: item.itemid,
          }
        );

        if (response.data.success) {
          setIsFavorite(true);
          Toast.success("Added to favorites");
        } else {
          throw new Error(
            response.data.message || "Failed to add to favorites"
          );
        }
      } else {
        // Find favoriteMenuItemId from the item's FavoriteMenuItem array
        let favoriteMenuItemId = null;

        if (item.FavoriteMenuItem && item.FavoriteMenuItem.length > 0) {
          // Find entry for current user
          const favoriteEntry = item.FavoriteMenuItem.find(
            (fav) => fav.customerAuthUID === user.customerAuthUID
          );

          if (favoriteEntry) {
            favoriteMenuItemId = favoriteEntry.favoriteMenuItemId;
          }
        }

        if (!favoriteMenuItemId) {
          throw new Error("Could not find favorite item ID");
        }

        // Remove from favorites
        const response = await axios.delete(
          `${
            import.meta.env.VITE_APP_BACKEND_BASE_URL
          }favorite/favorite/deletefavoriteMenuItem/${favoriteMenuItemId}`
        );

        if (response.data.success) {
          setIsFavorite(false);
          Toast.success("Removed from favorites");
        } else {
          throw new Error(
            response.data.message || "Failed to remove from favorites"
          );
        }
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      Toast.error(error.message || "Failed to update favorite status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get item description for the modal
  const getItemDescription = (cartItem) => {
    let description = [];

    // Add variation info if any
    if (cartItem.extra && cartItem.extra.length > 0) {
      description.push(`Variation: ${cartItem.extra[0].name}`);
    }

    // Add addon info if any
    if (cartItem.addons) {
      Object.keys(cartItem.addons).forEach((addonGroupId) => {
        const addonGroup = cartItem.addons[addonGroupId];
        if (
          addonGroup.selectedItemsAddonData &&
          addonGroup.selectedItemsAddonData.length > 0
        ) {
          try {
            const addonNames = addonGroup.selectedItemsAddonData
              .map((addon) => addon.name)
              .join(", ");
            // If we have the addon group name, include it; otherwise just show the addons
            if (addonGroup.name) {
              description.push(`${addonGroup.name}: ${addonNames}`);
            } else {
              description.push(`Addon: ${addonNames}`);
            }
          } catch (error) {
            console.error("Error processing addon data:", error);
            description.push("Custom addons");
          }
        }
      });
    }

    return description.length > 0
      ? description.join(", ")
      : "No customizations";
  };

  return (
    <>
      <div
        className={`bg-white rounded-[12px] border md:border-gray-200 border-gray-100 p-1.5 relative ${
          !item.status ? "opacity-75" : ""
        }`}
      >
        {!item.status && (
          <div className="absolute inset-0 bg-white/50 rounded-[12px] z-10 flex items-center justify-center">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
        {item.disabledDueToTime && (
          <div className="absolute inset-0 bg-white/50 rounded-[12px] z-10 flex items-center justify-center">
            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-medium">
              Time's Up
            </span>
          </div>
        )}
        {item.disabled && (
          <div className="absolute inset-0 bg-white/50 rounded-[12px] z-10 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              Purchased
            </span>
          </div>
        )}
        <div className="relative">
          <img
            src={item.item_image_url || dummyImage}
            alt={item.itemname}
            className="w-full h-32 object-cover rounded-[12px] mb-2"
          />
          {/* Food type indicator (Veg/Non-veg/Egg) */}
          <div className="absolute top-2 left-2 bg-white p-0.5 rounded-md shadow-sm">
            {foodType.color === "green" && (
              <div className="w-4 h-4 border border-green-600 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              </div>
            )}
            {foodType.color === "red" && (
              <div className="w-4 h-4 border border-red-600 rounded-sm flex items-center justify-center">
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-600"></div>
              </div>
            )}
            {foodType.color === "yellow" && (
              <div className="w-4 h-4 border border-yellow-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              </div>
            )}
          </div>

          {/* Key information badges on image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent rounded-b-[12px] flex items-end p-2">
            {!!item.kcal && (
              <div className="text-white text-sm font-bold flex items-center">
                <LocalFireDepartmentIcon
                  style={{ fontSize: "12px", opacity: "0.8" }}
                  className="mr-0.5"
                />
                <span className="opacity-80">{item.kcal} kcal</span>
              </div>
            )}
          </div>

          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-[12px]"
            disabled={isProcessing}
          >
            <svg
              className={`w-5 h-5 cursor-pointer ${
                isFavorite ? "text-[#FF583A] fill-current" : "text-gray-600"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        <h3 className="font-medium">{item.itemname}</h3>
        <p className="text-xs text-gray-600 truncate">
          {item.itemdescription || "Delicious " + item.itemname}
        </p>

        {/* Item details section - serving info, calories, prep time */}
        <div className="flex flex-wrap gap-2 mt-1 mb-2">
          {!!item.minimumpreparationtime && (
            <div className="flex items-center text-xs text-gray-500">
              <AccessTimeIcon
                fontSize="extra-small"
                className="mr-0.5 text-gray-400"
              />
              <span>{item.minimumpreparationtime} min</span>
            </div>
          )}
          {/* {!!item.kcal && (
            <div className="flex items-center text-xs text-gray-500">
              <LocalFireDepartmentIcon fontSize="extra-small" className="mr-0.5 text-gray-400" />
              <span>{item.kcal} kcal</span>
            </div>
          )} */}
          {!!item.servinginfo && (
            <div className="flex items-center text-xs text-gray-500">
              <RestaurantIcon
                fontSize="extra-small"
                className="mr-0.5 text-gray-400"
              />
              <span>Serves {item.servinginfo}</span>
            </div>
          )}
        </div>
        {/* Customization badge */}
        {allowsCustomization && (
          <div
            title="Customizable"
            className="flex items-center justify-start text-xs text-orange-800 opacity-70"
          >
            {/* <TuneIcon style={{ fontSize: "15px" }} /> */}
            <span>Customisable</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold">₹{item.price}</span>
          {itemQuantity > 0 ? (
            <div className="flex items-center">
              <button
                onClick={handleDecrement}
                className={`px-2 py-1 cursor-pointer active:scale-95 transition-transform duration-200 ${
                  item.status && !item.disabledDueToTime && !item.disabled
                    ? "bg-[#FF583A] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } rounded-l-lg text-sm font-bold`}
                disabled={
                  !item.status || item.disabledDueToTime || item.disabled
                }
              >
                -
              </button>
              <span
                className={`px-2 py-1 text-sm ${
                  item.status && !item.disabledDueToTime && !item.disabled
                    ? "bg-[#FF583A] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {itemQuantity}
              </span>
              <button
                onClick={handleIncrement}
                className={`px-2 py-1 cursor-pointer active:scale-95 transition-transform duration-200 ${
                  item.status && !item.disabledDueToTime && !item.disabled
                    ? "bg-[#FF583A] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } rounded-r-lg text-sm font-bold`}
                disabled={
                  !item.status ||
                  item.disabledDueToTime ||
                  item.disabled ||
                  (item.isMessItem && itemQuantity >= 1)
                }
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className={`px-1 py-1 cursor-pointer active:scale-95 transition-transform duration-200 ${
                item.status && !item.disabledDueToTime && !item.disabled
                  ? "bg-[#FF583A] text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } rounded-lg text-sm`}
              disabled={!item.status || item.disabledDueToTime || item.disabled}
            >
              <AddIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      {/* Using UnifiedItemModal instead of AddItemModal */}
      <UnifiedItemModal
        show={showUnifiedModal}
        onClose={() => setShowUnifiedModal(false)}
        item={item}
        modalType="add"
        onRepeatItem={handleRepeatItem}
        onChooseCustomization={handleChooseCustomization}
        matchingCartItems={matchingCartItems}
        getItemDescription={getItemDescription}
      />

      {/* Using the extracted RemoveItemModal component */}
      <RemoveItemModal
        show={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        item={item}
        matchingCartItems={matchingCartItems}
        onRemoveItem={handleRemoveItem}
        getItemDescription={getItemDescription}
      />
    </>
  );
};

export default MenuItemCard;
