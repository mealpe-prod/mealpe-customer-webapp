import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { clearCart } from '../../redux/slices/cartSlice';

const RAZORPAY_KEY = "rzp_live_Ci714sLON1ushb";
// const RAZORPAY_KEY = "rzp_test_g3z8vg4oBpnLUK";

const ContinueButton = ({ isOutletOpen, paymentMode, orderType, priceBreakdown, customerAuthUID, outletId, deliveryAddress, instruction, scheduleType, selectedDate, selectedTime }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const items = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  
  // Check if delivery address is required and provided
  const isDeliveryAddressRequired = orderType === 'delivery' && !deliveryAddress?.trim();
  
  // Load Razorpay script
  useEffect(() => {
    if (paymentMode === 'online') {
      const scriptSrc = "https://checkout.razorpay.com/v1/checkout.js";

      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () =>
            reject(new Error(`Failed to load script: ${src}`));
          document.body.appendChild(script);
        });
      };

      loadScript(scriptSrc)
        .then(() => {
          console.log("Razorpay script loaded successfully");
        })
        .catch((error) => {
          console.error("Error while loading Razorpay script:", error);
        });

      return () => {
        const script = document.querySelector(`script[src="${scriptSrc}"]`);
        if (script) {
          document.body.removeChild(script);
        }
      };
    }
  }, [paymentMode]);
  
  // Handle RSVP increase for mess items
  const handleMessRSVP = async (messItems, pickupTime) => {
    try {
      // Define meal type mapping
      const mealTypes = {
        Breakfast: 1,
        Lunch: 2,
        'High Tea': 3,
        Dinner: 4,
      };
      
      // Extract unique meal type IDs from mess items
      const mealTypeIds = [...new Set(messItems.map(item => {
        // Assuming the meal type is stored in the item, adjust as needed
        return item.name ? mealTypes[item.name] : null;
      }).filter(id => id !== null))];
      
      if (mealTypeIds.length === 0) return;
      
      // Get date from pickupTime in format MM/DD/YYYY
      let date;
      
      // First, check if pickupTime has a valid orderDate property
      if (pickupTime && 
          pickupTime.orderDate && 
          typeof pickupTime.orderDate === 'string' && 
          pickupTime.orderDate.includes('/') && 
          !pickupTime.orderDate.includes('NaN')) {
        date = pickupTime.orderDate;
      } else {
        // Fallback to current date if pickupTime date is invalid
        const today = new Date();
        date = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
      }

      // Double check the date format to ensure it's not NaN/NaN/NaN
      const dateParts = date.split('/');
      if (dateParts.length !== 3 || 
          dateParts.some(part => part === 'NaN' || isNaN(parseInt(part, 10)))) {
        const today = new Date();
        date = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
      }

      // console.log("handleMessRSVP using date:", date, {
      //   customerAuthUID,
      //   mealTypeIds,
      //   outletId,
      //   date
      // });
      
      // Call RSVP API
      const rsvpResponse = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}mess/rsvp/cncRSVP`,
        {
          customerAuthUID,
          mealTypeIds,
          outletId,
          date
        }
      );
      
      if (rsvpResponse.data.success) {
        console.log('RSVP increased successfully');
      } else {
        console.error('Failed to increase RSVP:', rsvpResponse.data.message);
      }
    } catch (error) {
      console.error('Error increasing RSVP:', error);
      // Log the error but don't interrupt the order flow
      console.log('Error details:', error.response?.data || error.message);
    }
  };
  
  // Create order after successful payment
  const createOrder = async (txnid) => {
    try {
      // Format date and time for pickupTime
      let pickupTime = null;
      if (scheduleType === 'later' && selectedDate && selectedTime) {
        try {
          const date = new Date(selectedDate);
          
          // Validate date is not Invalid Date
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          
          // Parse time safely
          let hours = 0;
          let minutes = 0;
          
          if (selectedTime && selectedTime.includes(':')) {
            const timeParts = selectedTime.split(':').map(part => parseInt(part, 10));
            if (!isNaN(timeParts[0])) hours = timeParts[0];
            if (timeParts.length > 1 && !isNaN(timeParts[1])) minutes = timeParts[1];
          }
          
          date.setHours(hours, minutes, 0, 0);
          
          // Format date for pickupTime object
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const day = days[date.getDay()];
          const monthName = months[date.getMonth()];
          const dateNum = date.getDate().toString().padStart(2, '0');
          const year = date.getFullYear();
          
          // Format time (12-hour format with am/pm)
          let hours12 = hours % 12 || 12;
          const ampm = hours >= 12 ? 'pm' : 'am';
          const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          
          // Format date MM/DD/YYYY
          const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
          
          pickupTime = {
            date: {
              label: date.toDateString() === new Date().toDateString() ? 'Today' : 'Scheduled',
              day: day,
              date: `${monthName} ${dateNum}`,
              year: year.toString()
            },
            orderDate: formattedDate,
            time: formattedTime
          };
        } catch (err) {
          console.error('Error formatting scheduled date/time:', err);
          // If there's any error in formatting, fall back to current time
          const fallbackTime = getFallbackPickupTime();
          pickupTime = fallbackTime;
        }
      } else {
        // For immediate orders, set current time
        pickupTime = getFallbackPickupTime();
      }
      
      // Helper function to get current time as pickupTime
      function getFallbackPickupTime() {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const dateNum = now.getDate().toString().padStart(2, '0');
        const year = now.getFullYear();
        
        // Format time (12-hour format with am/pm)
        const hours = now.getHours();
        let hours12 = hours % 12 || 12;
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        // Format date MM/DD/YYYY
        const formattedDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
        
        return {
          date: {
            label: 'Today',
            day: day,
            date: `${monthName} ${dateNum}`,
            year: year.toString()
          },
          orderDate: formattedDate,
          time: formattedTime
        };
      }
      
      // Check for mess items
      const messItems = items.filter(item => item.isMessItem === true);
      const isMessOrder = messItems.length > 0;
      
      // Log pickupTime for debugging
      console.log("Using pickupTime:", pickupTime);
      
      // Prepare request body for create order
      const orderRequestBody = {
        txnid,
        isScheduleNow: scheduleType === 'now',
        customerAuthUID,
        outletId,
        restaurantId: null,
        isDineIn: orderType === 'dining',
        isDelivery: orderType === 'delivery',
        isPickUp: orderType === 'takeaway',
        address: orderType === 'delivery' 
          ? deliveryAddress
              .split('\n')
              .slice(1)
              .join(' ')
              .trim()
          : '',
        totalPrice: priceBreakdown.totalPriceForCustomer || 0,
        paymentId: '',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          outletId,
          restaurantId: null,
          item_image_url: item.image || '',
          minimumpreparationtime: item.minimumpreparationtime || 15,
          extra: item.extra || [],
          isEdit: false,
          previousItem: null,
          addons: item.addons || {},
          qty: item.qty,
          isMessItem: item.isMessItem || false
        })),
        pickupTime,
        basePrice: priceBreakdown.FoodBasePrice || 0,
        additional_Instruction: instruction || '',
        isCashOrder: paymentMode === 'cash',
        paymentType: paymentMode === 'wallet' ? 'wallet' : paymentMode === 'cash' ? 'cash' : 'online',
        isMessOrder,
        appName: 'MealPeWebApp'
      };
      
      // // Call create order API
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}order/order/createOrder`,
        orderRequestBody
      );
      
      if (orderResponse.data.success) {
        // For mess orders, handle RSVP
        if (isMessOrder) {
          // Call RSVP API for mess items
          await handleMessRSVP(messItems, pickupTime);
        }
        
        // Clear cart after successful order creation
        dispatch(clearCart());
        // Navigate to payment success page
        navigate('/payment-success', { 
          state: { 
            orderId: orderResponse.data.data.orderid,
            transactionId: txnid,
            paymentType: paymentMode,
            orderData: {
              totalAmount: priceBreakdown.totalPriceForCustomer || 0,
              basePrice: priceBreakdown.FoodBasePrice || 0,
              orderType: orderType,
              pickupTime: pickupTime,
              items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.qty,
                image: item.image,
                isMessItem: item.isMessItem || false
              })),
              address: orderType === 'delivery' ? deliveryAddress : null,
              instruction: instruction || ''
            }
          } 
        });
      } else {
        console.error('Failed to create order:', orderResponse.data.message);
        navigate('/payment-failed', { 
          state: { 
            errorMessage: 'Order creation failed. Please try again or contact support.'
          } 
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      navigate('/payment-failed', { 
        state: { 
          errorMessage: 'Error creating order. Please try again or contact support.'
        } 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinue = async () => {
    try {
      setLoading(true);
      
      // Common request body fields for both payment types
      const commonRequestBody = {
        itemTotalPrice: priceBreakdown.FoodBasePrice || 0,
        productinfo: items.map(item => item.name).join(', '),
        firstname: user?.customerName || '',
        phone: user?.mobile || '',
        email: user?.email || '',
        customerAuthUID,
        outletId,
        isDineIn: orderType === 'dining',
        isPickUp: orderType === 'takeaway',
        isDelivery: orderType === 'delivery'
      };
      
      let txnid;
      
      // Check payment type and call appropriate API
      if (paymentMode === 'wallet' || paymentMode === 'cash') {
        // For wallet or cash payment, call getTransactionIdForCOD
        const transactionRequestBody = {
          ...commonRequestBody,
          paymentType: paymentMode === 'wallet' ? 'wallet' : 'cash'
        };
        
        // Call API for COD/Wallet transaction ID
        const transactionResponse = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}payment/customer/getTransactionIdForCOD`,
          transactionRequestBody
        );
        
        if (transactionResponse.data.success) {
          txnid = transactionResponse.data.response.txnid;
          
          // Create order for cash/wallet payments
          await createOrder(txnid);
        } else {
          console.error('Failed to get transaction ID:', transactionResponse.data.message);
          setLoading(false);
          navigate('/payment-failed', { 
            state: { 
              errorMessage: 'Payment initialization failed. Please try again.'
            } 
          });
        }
      } else if (paymentMode === 'online') {
        // For online payment, call initiate-payment API
        const initiatePaymentResponse = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}payment/customer/initiate-payment`,
          commonRequestBody
        );
        
        if (initiatePaymentResponse.data.success) {
          txnid = initiatePaymentResponse.data.transactionId;
          const orderId = initiatePaymentResponse.data.response.orderId;
          const amount = initiatePaymentResponse.data.response.amount;
          
          // Initialize Razorpay payment
          const options = {
            key: RAZORPAY_KEY,
            amount: amount, // Amount in smallest currency unit (paise)
            currency: initiatePaymentResponse.data.response.currency || 'INR',
            name: "MealPe",
            description: "Food Order Payment",
            order_id: orderId,
            handler: async function (response) {
              try {
                // Verify payment
                const verifyResponse = await axios.post(
                  `${import.meta.env.VITE_APP_BACKEND_BASE_URL}payment/customer/success-payment`,
                  {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }
                );
                
                if (verifyResponse.data.success) {
                  // Create order after successful payment verification
                  await createOrder(txnid);
                } else {
                  console.error('Payment verification failed:', verifyResponse.data.message);
                  setLoading(false);
                  // Navigate to payment failed page
                  navigate('/payment-failed', { 
                    state: { 
                      errorMessage: 'Payment verification failed. Please try another payment method or contact support.'
                    } 
                  });
                }
              } catch (error) {
                console.error('Error verifying payment:', error);
                setLoading(false);
                // Navigate to payment failed page
                navigate('/payment-failed', { 
                  state: { 
                    errorMessage: 'Error verifying payment. Please try again or choose a different payment method.'
                  } 
                });
              }
            },
            prefill: {
              name: user?.customerName || '',
              email: user?.email || '',
              contact: user?.mobile || ''
            },
            theme: {
              color: "#FF583A"
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                // Navigate to payment failed page for cancelled payment
                navigate('/payment-failed', { 
                  state: { 
                    errorMessage: 'Payment was cancelled. Please try again.'
                  } 
                });
              }
            }
          };
          
          // Initialize and open Razorpay payment form
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
        } else {
          console.error('Failed to initiate payment:', initiatePaymentResponse.data.message);
          setLoading(false);
          navigate('/payment-failed', { 
            state: { 
              errorMessage: 'Payment initialization failed. Please try again or choose a different payment method.'
            } 
          });
        }
      } else {
        // For other payment types (if any), just navigate to checkout
        navigate('/checkout');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setLoading(false);
      navigate('/payment-failed', { 
        state: { 
          errorMessage: 'Something went wrong while processing your payment. Please try again.'
        } 
      });
    }
  };
  
  return (
    <div className="px-4 space-y-3">
      {isDeliveryAddressRequired && (
        <div className="text-red-500 text-sm text-center mb-1">
          Please provide a delivery address to continue
        </div>
      )}
      <button 
        className={`w-full py-3 bg-[#FF583A] text-white rounded-[12px] font-medium active:scale-95 transition-all duration-300 cursor-pointer ${
          (!priceBreakdown.isAcceptingOnline && !priceBreakdown.isAcceptingWallet && !priceBreakdown.isAcceptingCash) || isDeliveryAddressRequired ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleContinue}
        disabled={loading || (!priceBreakdown.isAcceptingOnline && !priceBreakdown.isAcceptingWallet && !priceBreakdown.isAcceptingCash) || isDeliveryAddressRequired}
      >
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  );
};

export default ContinueButton; 