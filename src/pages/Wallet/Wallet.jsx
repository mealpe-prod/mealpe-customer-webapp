import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RestoreIcon from '@mui/icons-material/Restore';
import Avatar from '@mui/material/Avatar';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

const RAZORPAY_KEY = 'rzp_live_Ci714sLON1ushb';

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [inputAmount, setInputAmount] = useState('1000');
  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();
  
  // For date range
  const [fromDate, setFromDate] = useState(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Load Razorpay script
  useEffect(() => {
    const scriptSrc = "https://checkout.razorpay.com/v1/checkout.js";

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
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
  }, []);

  // Infinite scroll last element ref callback
  const lastTransactionElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTransactions();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      // Fetch wallet balance
      const userId = user?.customerAuthUID;
      const balanceResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/getWalletData/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const balanceData = await balanceResponse.json();
      if (!balanceData.success) {
        console.error('Error fetching wallet balance:', balanceData.message);
        Toast.error(balanceData.message);
        setIsLoading(false);
        return;
      }
      // console.log(balanceData);
      setWalletBalance(balanceData.response.balance || 0);
      
      // Reset pagination state
      setPage(1);
      setHasMore(true);
      setTransactions([]);
      
      // Fetch initial wallet transactions
      await fetchTransactions(1);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setIsLoading(false);
    }
  };

  // Fetch transactions with pagination
  const fetchTransactions = async (pageNum) => {
    try {
      const userId = user?.customerAuthUID;
      
      const transactionsResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/getWalletTransactions/${userId}?from=${fromDate}&to=${toDate}&page=${pageNum}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const transactionsData = await transactionsResponse.json();
      
      if (transactionsData.success) {
        // Transform the API response to match our component's expected format
        const formattedTransactions = transactionsData.response.map(transaction => ({
          id: transaction.walletTransactionId,
          type: transaction.transactionType.toLowerCase(),
          amount: transaction.amount,
          description: transaction.description || "Wallet top-up",
          date: transaction.created_at,
          status: transaction.status,
          outletId: transaction.outletId,
          orderId: transaction.orderId
        }));
        
        // Update pagination state
        const { pagination } = transactionsData.metadata;
        setHasMore(pagination.hasNextPage);
        
        // Append to existing transactions if loading more, otherwise replace
        if (pageNum === 1) {
          setTransactions(formattedTransactions);
        } else {
          setTransactions(prev => [...prev, ...formattedTransactions]);
        }
      } else {
        console.error('Error fetching wallet transactions:', transactionsData.message);
        Toast.error(transactionsData.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Toast.error("Something went wrong. Please try again later.");
    }
  };

  // Load more transactions when scrolling
  const loadMoreTransactions = async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchTransactions(nextPage);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  // Initial data load
  useEffect(() => {
    fetchWalletData();
  }, [user?.customerAuthUID]);

  // Handle add money to wallet
  const handleAddMoney = async () => {
    try {
      setIsLoading(true);
      
      const amount = inputAmount;
      
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount");
        setIsLoading(false);
        return;
      }
      
      // Prepare data for API call
      const paymentData = {
        amount: amount, 
        description: "Wallet top-up",
        customerAuthUID: user?.customerAuthUID,
        firstname: (user?.customerName?.split(' ')[0]) || (user?.firstName?.split(' ')[0]) || "User",
        phone: user?.mobile || "",
        email: user?.email || ""
      };
      
      // Make API call to create order
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/initiate-wallet-topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      const data = await response.json();
      
      if (data.success && data.response?.orderId) {
        const options = {
          key: RAZORPAY_KEY,
          amount: paymentData.amount,
          currency: "INR",
          name: "MealPe",
          description: "Wallet top-up",
          order_id: data.response.orderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}wallet/userWallet/wallet-topup-response`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyResponse.json();
              
              if (verifyData.success) {
                Toast.success("Payment successful! Your wallet has been topped up.");
                fetchWalletData(); // Refresh wallet data
              } else {
                Toast.error("Payment verification failed. Please contact support.");
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              Toast.error("Error verifying payment. Please contact support.");
            }
          },
          prefill: {
            name: paymentData.firstname,
            email: paymentData.email,
            contact: paymentData.phone
          },
          theme: {
            color: "#FF583A"
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        Toast.error(data.message || "Failed to create payment order. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      Toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle preset amount selection
  const handlePresetAmount = (amount) => {
    setInputAmount(amount);
  };

  // Toggle transaction history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Navigate to history view
  const navigateToHistory = () => {
    setShowHistory(true);
  };

  // Navigate back to wallet
  const navigateToWallet = () => {
    setShowHistory(false);
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Format time to readable format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-3 bg-white shadow-sm mb-2">
        <button 
          onClick={() => showHistory ? navigateToWallet() : navigate("/home")} 
          className="p-1 rounded-full cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-base" />
        </button>
        <h1 className="text-lg font-medium mx-auto">
          {showHistory ? "Transaction History" : "Wallet"}
        </h1>
        {!showHistory && (
          <button 
            onClick={navigateToHistory} 
            className="p-2 text-[#FF583A] cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <RestoreIcon className="text-lg" />
          </button>
        )}
        {showHistory && <div className="w-10"></div>}
      </div>

      {!showHistory ? (
        <div className="flex flex-col h-full">
          {/* Wallet Balance Card */}
          <div className="mx-4 mt-4 bg-white rounded-lg p-5 shadow-sm">
            <div className="flex flex-col items-center">
              <h2 className="text-base font-medium text-gray-700">Wallet Balance</h2>
              <p className="text-xl font-bold text-[#FF583A] mt-1">₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Add Money Section */}
          <div className="mx-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add money to Wallet</h3>
            
            {/* Amount Input */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <p className="text-xs text-gray-500 mb-1">Enter Amount</p>
              <div className="flex items-center border-b-1 border-gray-200 py-1">
                <span className="text-gray-700 text-lg mr-2">₹</span>
                <input
                  type="text"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="appearance-none bg-transparent border-none w-full text-gray-700 text-lg mr-3 py-1 leading-tight focus:outline-none"
                />
              </div>
            </div>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <button 
                onClick={() => handlePresetAmount('500')}
                className={`py-2 rounded-lg text-center font-medium text-sm cursor-pointer active:scale-95 transition-transform duration-200 ${inputAmount === '500' ? 'bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A]' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                ₹500
              </button>
              <button 
                onClick={() => handlePresetAmount('1000')}
                className={`py-2 rounded-lg text-center font-medium text-sm cursor-pointer active:scale-95 transition-transform duration-200 ${inputAmount === '1000' ? 'bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A]' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                ₹1000
              </button>
              <button 
                onClick={() => handlePresetAmount('2000')}
                className={`py-2 rounded-lg text-center font-medium text-sm cursor-pointer active:scale-95 transition-transform duration-200 ${inputAmount === '2000' ? 'bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A]' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                ₹2000
              </button>
              <button 
                onClick={() => handlePresetAmount('5000')}
                className={`py-2 rounded-lg text-center font-medium text-sm cursor-pointer active:scale-95 transition-transform duration-200 ${inputAmount === '5000' ? 'bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A]' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                ₹5000
              </button>
            </div>
            
            {/* Add Balance Button */}
            <button 
              className="w-full bg-[#FF583A] text-white py-3 px-4 rounded-[12px] text-center font-medium text-sm shadow-md hover:bg-[#FF583A] cursor-pointer active:scale-95 transition-transform duration-200"
              onClick={handleAddMoney}
              disabled={isLoading}
            >
              {isLoading ? <Loader/> : 'Proceed to Add Balance'}
            </button>
          </div>
        </div>
      ) : (
        /* Transaction History */
        <div className="flex flex-col h-full">

          {isLoading ? (
            <div className="flex flex-col space-y-4 w-full p-4">
              {/* Transaction skeleton items */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="py-3 px-4 bg-white border-b border-gray-100 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full h-9 w-9"></div>
                      <div className="ml-3">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => {
                const isLastElement = index === filteredTransactions.length - 1;
                return (
                  <div 
                    key={transaction.id} 
                    ref={isLastElement ? lastTransactionElementRef : null}
                    onClick={() => transaction.orderId !== null && navigate(`/order/${transaction.orderId}`)} 
                    className="py-3 px-4 bg-white border-b border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="bg-gray-400 text-white" sx={{ width: 36, height: 36 }}>
                          W
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.date)} {formatTime(transaction.date)}
                            {transaction.status === "pending" && <span className="ml-2 text-amber-600">(Pending)</span>}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-3">
                  <Loader />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <HistoryIcon className="text-3xl mb-2" />
              <p className="text-sm">No transactions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet; 