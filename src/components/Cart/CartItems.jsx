import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import UnifiedItemModal from '../Outlet/UnifiedItemModal';
import { useNavigate } from 'react-router-dom';
import dummyImage from '../../assets/mealpe.png';

const CartItems = ({ items, handleRemoveAll, handleIncreaseQuantity, handleDecreaseQuantity, formatCurrency, calculateItemTotal }) => {
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const handleAddClick = (item) => {
    try {
      // If both itemallowvariation and itemallowaddon are "0", directly increase quantity
      if ((item.itemallowvariation === "0" || item.itemallowvariation === 0) && 
          (item.itemallowaddon === "0" || item.itemallowaddon === 0)) {
        handleIncreaseQuantity(item);
      } else {
        // Otherwise show the modal for customization
        setSelectedItem(item);
        setShowItemModal(true);
      }
    } catch (error) {
      console.error("Error handling add click:", error);
    }
  };

  const handleCloseModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const handleRepeatItem = () => {
    try {
      if (selectedItem) {
        handleIncreaseQuantity(selectedItem);
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error repeating item:", error);
    }
  };

  const handleChooseCustomization = () => {
    try {
      if (selectedItem) {
        // Close the modal first
        handleCloseModal();
        
        // Navigate to item details page with the item id
        navigate(`/outlet/${selectedItem.outletId}/${selectedItem.item_id || selectedItem.id}`);
      }
    } catch (error) {
      console.error("Error navigating to item details:", error);
    }
  };

  // Format the item description
  const getItemDescription = (item) => {
    let description = '';
    
    if (item.addons && Object.keys(item.addons).length > 0) {
      Object.values(item.addons).forEach(addonGroup => {
        if (addonGroup.selectedItemsAddonData && addonGroup.selectedItemsAddonData.length > 0) {
          description += addonGroup.selectedItemsAddonData.map(addon => addon.name).join(', ');
        }
      });
    }
    
    return description;
  };

  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium">Cart Items</h2>
        {items.length > 0 && (
          <button 
            onClick={handleRemoveAll}
            className="text-[#FF583A] text-sm font-medium active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Remove All
          </button>
        )}
      </div>

      <div className="mb-3 font-medium text-sm">
        {items.length} ITEM IN THE CART
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-[12px] overflow-hidden">
              <img 
                src={item.item_image_url || dummyImage} 
                alt={item.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-gray-500 text-sm">
                Price: {formatCurrency(item.price)} * {item.qty || 1}
              </p>
              {item.extra && item.extra.length > 0 && (
                <p className="text-sm text-gray-500">
                  {item.extra[0].name}
                </p>
              )}
              {item.addons && Object.keys(item.addons).length > 0 && (
                <div>
                  {Object.values(item.addons).map((addonGroup, idx) => (
                    addonGroup.selectedItemsAddonData && addonGroup.selectedItemsAddonData.length > 0 && (
                      <p key={idx} className="text-sm text-gray-500">
                        {addonGroup.selectedItemsAddonData.map(addon => addon.name).join(', ')}
                      </p>
                    )
                  ))}
                </div>
              )}
              {/* <button className="text-sm text-[#FF583A] mt-1 flex items-center active:scale-95 transition-all duration-300 cursor-pointer">
                Edit 
                <span className="ml-1 w-3 h-3 border border-[#FF583A] rounded-full text-[#FF583A] flex items-center justify-center text-[8px]">✓</span>
              </button> */}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
              <div className="text-sm font-medium">
              {formatCurrency(calculateItemTotal(item))}
            </div>
            <div className="flex items-center">
              <button 
                className="w-7 h-7 flex items-center justify-center rounded-full border border-[#FF583A] text-[#FF583A] active:scale-95 transition-all duration-300 cursor-pointer"
                onClick={() => handleDecreaseQuantity(item)}
              >
                <RemoveIcon fontSize="small" />
              </button>
              <span className="mx-2 w-6 text-center">{item.qty || 1}</span>
              <button 
                className="w-7 h-7 flex items-center justify-center rounded-full border border-[#FF583A] text-[#FF583A] active:scale-95 transition-all duration-300 cursor-pointer"
                onClick={() => handleAddClick(item)}
              >
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* UnifiedItemModal */}
      <UnifiedItemModal 
        show={showItemModal}
        onClose={handleCloseModal}
        item={selectedItem || {}}
        modalType="add"
        onRepeatItem={handleRepeatItem}
        onChooseCustomization={handleChooseCustomization}
        matchingCartItems={selectedItem ? [selectedItem] : []}
        getItemDescription={getItemDescription}
        totalPrice={selectedItem ? calculateItemTotal(selectedItem) : 0}
      />
    </div>
  );
};

export default CartItems; 