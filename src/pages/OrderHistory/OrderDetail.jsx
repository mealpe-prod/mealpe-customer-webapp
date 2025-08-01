import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import ShareIcon from "@mui/icons-material/Share";
import {
  Snackbar,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { QRCodeSVG } from "qrcode.react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSocket } from "../../hooks/useSocket";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showQrView, setShowQrView] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [qrType, setQrType] = useState("order"); // 'order' or 'clearance'
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [sharingQr, setSharingQr] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [showQrCode, setShowQRCode] = useState(false);
  const [messMenu, setMessMenu] = useState(null);
  const [loadingMessMenu, setLoadingMessMenu] = useState(false);
  const [messMenuError, setMessMenuError] = useState(null);
  const { connectSocket, disconnectSocket, qrCodeData } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();

    // Set up SSE connection for real-time order status updates
    const eventSource = new EventSource(
      `${
        import.meta.env.VITE_APP_BACKEND_BASE_URL
      }customer/realtimeCustomerOrders/${orderId}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened for order status updates");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("Received real-time order update:", data);
        if (data.updateorder) {
          // Update only the order status without refetching the entire order
          setOrderData((prevData) => ({
            ...prevData,
            orderStatusId: {
              ...prevData.orderStatusId,
              orderStatusId: data.updateorder.orderStatusId,
            },
          }));
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      // Attempt to reconnect automatically
    };

    // Clean up EventSource when component unmounts
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [orderId]);

  // Add a new useEffect for fetching mess menu when orderData changes
  useEffect(() => {
    // Only fetch if it's a mess order and we have the required data
    if (orderData?.isMessOrder && orderData?.outletId?.outletId) {
      fetchMessMenu();
    }
  }, [orderData]);

  // Handle socket connection when QR code modal is open for mess orders
  useEffect(() => {
    if (showQrCode && orderData?.isMessOrder && user?.customerAuthUID) {
      connectSocket(user.customerAuthUID);
    } else {
      disconnectSocket();
    }
    
    return () => {
      disconnectSocket();
    };
  }, [showQrCode, user?.customerAuthUID, orderData?.isMessOrder]);

  // Handle qrCodeData updates for mess orders
  useEffect(() => {
    if (qrCodeData && orderData?.isMessOrder) {
      try {
        if (
          qrCodeData?.success === true &&
          qrCodeData?.message === 'Meal Served Successfully'
        ) {
          setSnackbarMessage('Meal served successfully');
          setSnackbarOpen(true);
          
          // Add vibration if browser supports it
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          // Send order to history
          sendOrderToHistory(orderId);
          
          // Close QR code modal
          setShowQRCode(false);
        } else if (
          qrCodeData?.success === false &&
          qrCodeData?.message === 'Meal already served'
        ) {
          setSnackbarMessage('Meal already served');
          setSnackbarOpen(true);
          
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
          
          // Close QR code modal
          setShowQRCode(false);
        }
      } catch (err) {
        console.error('Error handling QR code data:', err);
      }
    }
  }, [qrCodeData, orderData?.isMessOrder]);
  
  // Function to send order to history after successful QR scan
  const sendOrderToHistory = async (orderId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}order/order/sendOrderToHistory`,
        { orderId }
      );
      
      if (response.data.success) {
        console.log("Order successfully sent to history");
        // Update the order data to reflect the change
        fetchOrderDetails();
      } else {
        console.error("Failed to send order to history:", response.data.message);
      }
    } catch (err) {
      console.error("Error sending order to history:", err);
    }
  };

  const fetchMessMenu = async () => {
    try {
      setLoadingMessMenu(true);
      setMessMenuError(null);
      const outletId = orderData?.outletId?.outletId;
      const customerAuthUID = orderData?.customerAuthUID?.customerAuthUID;

      if (!outletId || !customerAuthUID) {
        setMessMenuError("Missing required data for menu fetch");
        setLoadingMessMenu(false);
        return;
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }mess/weeklyMenu/getMessMenu/${outletId}?cuid=${customerAuthUID}`
      );

      if (response.data.success) {
        setMessMenu(response.data);
        console.log("Mess Menu Data:", response.data);
      } else {
        setMessMenuError("Failed to fetch menu data");
      }
    } catch (err) {
      console.error("Error fetching mess menu:", err);
      setMessMenuError("Error fetching menu data. Please try again.");
    } finally {
      setLoadingMessMenu(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      if (!user.customerAuthUID) {
        setError("You need to be logged in to view order details");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }order/order/getOrder/${orderId}`
      );

      if (response.data.success) {
        setOrderData(response.data.data);
        // console.log("Order Data", response.data.data);
      } else {
        setError("Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("An error occurred while fetching your order details");
    } finally {
      setLoading(false);
    }
  };

  const copyOTP = async (otp) => {
    try {
      // Try using the newer clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(otp);
        setSnackbarMessage("OTP copied to clipboard");
        setSnackbarOpen(true);
      } else {
        // Fallback for older browsers and non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = otp;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          textArea.remove();
          setSnackbarMessage("OTP copied to clipboard");
          setSnackbarOpen(true);
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          setSnackbarMessage("Failed to copy OTP");
          setSnackbarOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setSnackbarMessage("Failed to copy OTP");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const openQrView = (type = "order") => {
    setQrType(type);
    setShowQrView(true);
  };

  const closeQrView = () => {
    setShowQrView(false);
  };

  const downloadQrCode = () => {
    try {
      setDownloadingQr(true);
      const svg = document.querySelector(".qr-code-svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `Order_${
          orderData?.orderSequenceId || "QR"
        }.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        setSnackbarMessage("QR code downloaded successfully");
        setSnackbarOpen(true);
        setDownloadingQr(false);
      };

      img.onerror = () => {
        console.error("Error loading image");
        setSnackbarMessage("Failed to download QR code");
        setSnackbarOpen(true);
        setDownloadingQr(false);
      };

      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.src = url;
    } catch (err) {
      console.error("Error downloading QR code:", err);
      setSnackbarMessage("Failed to download QR code");
      setSnackbarOpen(true);
      setDownloadingQr(false);
    }
  };

  const shareQrCode = async () => {
    try {
      setSharingQr(true);
      // Create a canvas element to convert the QR code to an image
      const canvas = document.createElement("canvas");
      const svg = document.querySelector(".qr-code-svg");
      const data = new XMLSerializer().serializeToString(svg);
      const win = window.URL || window.webkitURL || window;
      const img = new Image();
      const blob = new Blob([data], { type: "image/svg+xml" });
      const url = win.createObjectURL(blob);

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
          try {
            // Check if the Web Share API is available
            if (navigator.share && navigator.canShare) {
              const file = new File([blob], "qrcode.png", {
                type: "image/png",
              });
              const shareData = {
                title: "Order QR Code",
                text: "Scan this QR code to get order details",
                files: [file],
              };

              // Check if we can share files
              if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                setSnackbarMessage("QR code shared successfully");
              } else {
                // Fallback if files can't be shared
                await navigator.share({
                  title: "Order QR Code",
                  text: "Scan this QR code to get order details",
                });

                // Also download the file since we couldn't share it
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "qrcode.png";
                a.click();
                URL.revokeObjectURL(url);

                setSnackbarMessage(
                  "QR code downloaded (sharing not fully supported)"
                );
              }
            } else {
              // Fallback for browsers that don't support Web Share API
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "qrcode.png";
              a.click();
              URL.revokeObjectURL(url);

              setSnackbarMessage("QR code downloaded (sharing not supported)");
            }
            setSnackbarOpen(true);
          } catch (err) {
            console.error("Error sharing QR code:", err);
            setSnackbarMessage("Failed to share QR code");
            setSnackbarOpen(true);
          } finally {
            setSharingQr(false);
          }
        });
      };

      img.onerror = () => {
        console.error("Error loading image for sharing");
        setSnackbarMessage("Failed to share QR code");
        setSnackbarOpen(true);
        setSharingQr(false);
      };

      img.src = url;
    } catch (err) {
      console.error("Error preparing QR code for sharing:", err);
      setSnackbarMessage("Failed to share QR code");
      setSnackbarOpen(true);
      setSharingQr(false);
    }
  };

  // Order cancellation functions
  const openCancelModal = () => {
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
  };

  const cancelOrder = async () => {
    try {
      setCancelLoading(true);

      if (!user.customerAuthUID) {
        setSnackbarMessage("You need to be logged in to cancel this order");
        setSnackbarOpen(true);
        closeCancelModal();
        return;
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }customer/cancelOrder/${orderId}`,
        {}
      );

      if (response.data.success) {
        setSnackbarMessage("Order cancelled successfully");
        setSnackbarOpen(true);
        // Refresh order details to show updated status
        fetchOrderDetails();
      } else {
        setSnackbarMessage(response.data.message || "Failed to cancel order");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setSnackbarMessage(
        err.response?.data?.message ||
          "An error occurred while cancelling your order"
      );
      setSnackbarOpen(true);
    } finally {
      setCancelLoading(false);
      closeCancelModal();
    }
  };

  // Order status steps
  const getOrderSteps = () => {
    if (!orderData || !orderData.orderStatusId) return [];

    const { orderStatusId } = orderData.orderStatusId;

    // For cancelled or rejected orders, show a different set of steps
    if (orderStatusId === -1 || orderStatusId === -2) {
      return [
        {
          id: 1,
          label: "Order Placed",
          description: "Waiting for the Restaurant to accept order",
        },
        {
          id: 2,
          label: "Order Cancelled",
          description: "Your order has been cancelled",
        },
      ];
    }

    // Default steps for normal orders
    return [
      {
        id: 1,
        label: "Order Placed",
        description: "Waiting for the Restaurant to accept order",
      },
      {
        id: 2,
        label: "Order Accepted",
        description:
          "Order Accepted! Waiting for the chefs to work their magic",
      },
      {
        id: 3,
        label: "Preparing Order",
        description:
          "Order in the kitchen! Waiting for the food to be prepared",
      },
      {
        id: 4,
        label: "Order Ready",
        description: "Yay! Your order is ready for you",
      },
      {
        id: 5,
        label: "Order Delivered",
        description: "Your order has been delivered successfully",
      },
    ];
  };

  // Determine current step based on order status
  const getCurrentStepIndex = () => {
    if (!orderData || !orderData.orderStatusId) return 0;

    const { orderStatusId } = orderData.orderStatusId;

    // If order is cancelled or rejected, return the appropriate index
    if (orderStatusId === -1 || orderStatusId === -2) {
      return 1; // Index of "Order Cancelled" in the cancelled order steps
    }

    // Map backend status to our step index
    switch (orderStatusId) {
      case 0:
        return 0;
      case 1:
      case 2:
      case 3:
        return 1;
      case 4:
        return 2;
      case 5:
        return 3;
      case 6:
      case 10:
        return 4;
      default:
        return 0;
    }
  };

  // Format the date from the API response
  const formatDate = (pickupTime) => {
    if (!pickupTime || !pickupTime.date) return "N/A";

    const { date } = pickupTime;
    return `${date.day}, ${date.date} ${date.year}`;
  };

  // Format the time from the API response
  const formatTime = (pickupTime) => {
    if (!pickupTime || !pickupTime.time) return "N/A";

    const timeString = pickupTime.time;
    let hours = parseInt(timeString.substring(0, 2));
    const minutes = timeString.substring(3, 5);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutes} ${ampm}`;
  };

  // Function to format date and time
  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return "";

    // Combine date and time strings
    const dateTimeString = `${dateString}T${timeString}`;
    const dateTime = new Date(dateTimeString);

    // Format date (e.g., "June 3, 2025")
    const formattedDate = dateTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format time in 12-hour format with AM/PM
    const formattedTime = dateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  // Skeleton loader component
  const OrderDetailSkeletonLoader = () => {
    return (
      <div className="bg-white animate-pulse p-4">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>

        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        </div>

        <div className="space-y-8 mb-6">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
              <div className="w-full">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4 mb-6">
          {[1, 2].map((index) => (
            <div key={index} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateQrData = (menuId) => {
    if (!orderData?.customerAuthUID?.customerAuthUID) return "";

    // For regular orders, return the existing format
    if (!orderData?.isMessOrder) {
      return `${menuId}===${orderData?.customerAuthUID?.customerAuthUID}`;
    }

    // For mess orders, find the matching menu item from the mess menu
    if (messMenu) {
      // Combine today and tomorrow menus
      const allMenuItems = [
        ...(messMenu.today || []),
        ...(messMenu.tomorrow || []),
      ];

      // Find the menu item that matches the order
      const matchedMenuItem = allMenuItems.find((item) => {
        // Compare based on meal type, time, or other identifiers from the order
        const orderMealType = orderData?.Order_Item?.[0]?.Menu_Item?.itemname;
        return (
          item.mealTypeId === orderMealType ||
          item.menuDescription.includes(orderMealType)
        );
      });

      if (matchedMenuItem) {
        return `${matchedMenuItem.menuId}===${orderData?.customerAuthUID?.customerAuthUID}`;
      } else {
        console.log("No matching menu item found in the mess menu");
      }
    }

    // Default fallback if no match found
    return `${menuId}===${orderData?.customerAuthUID?.customerAuthUID}`;
  };

  if (showQrView && orderData) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white shadow-sm">
          <button
            onClick={closeQrView}
            className="p-2 rounded-full cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <ArrowBackIosIcon className="text-xl" />
          </button>
          <h1 className="text-lg font-medium flex items-center">
            <span>
              {qrType === "clearance" ? "Clearance" : "Order"}{" "}
              <span className="text-[#FF583A] ml-2">
                #{orderData?.orderSequenceId || ""}
              </span>
            </span>
          </h1>
          <div className="w-10"></div> {/* For balance */}
        </div>

        {/* QR Content */}
        <div className="flex-1 flex items-start justify-center p-5 md:mt-10">
          <div className="bg-white rounded-xl p-5 w-full max-w-md mx-auto shadow-md flex flex-col">
            {/* Customer info and order ID */}
            <div className="text-center mb-3">
              <p className="text-xl font-bold">
                {user?.customerName || "Customer"}
              </p>
              {/* <p className="text-gray-500 text-sm">
                {qrType === "clearance" ? "Clearance" : "Order"} #
                {orderData?.orderSequenceId || ""}
              </p> */}
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-2 bg-white rounded-[12px]">
                <QRCodeSVG
                  value={`${orderData?.orderOTP}===${orderId}`}
                  size={window.innerWidth < 768 ? 250 : 150}
                  className="qr-code-svg"
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>
            <div className="text-center font-medium mb-3">
              {
                formatDateTime(
                  orderData?.Order_Schedule?.[0]?.scheduleDate,
                  orderData?.Order_Schedule?.[0]?.scheduleTime
                ).formattedDate
              }{" "}
              |{" "}
              {
                formatDateTime(
                  orderData?.Order_Schedule?.[0]?.scheduleDate,
                  orderData?.Order_Schedule?.[0]?.scheduleTime
                ).formattedTime
              }
            </div>
            {/* OTP */}
            <div className="p-3 bg-[#FFF1EE] rounded-[12px] mb-3">
              <p className="text-center text-[#FF583A] font-semibold">
                OTP: {orderData.orderOTP}
              </p>
            </div>

            {/* Time */}
            {orderData?.pickupTime && (
              <div className="text-center mb-3">
                <p className="font-semibold">
                  {formatTime(orderData.pickupTime)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(orderData.pickupTime)}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={downloadQrCode}
                disabled={downloadingQr}
                className="flex-1 py-3 cursor-pointer flex items-center justify-center gap-1 bg-[#FF583A] text-white rounded-[12px] font-medium transition-all text-sm disabled:opacity-70 active:scale-95 duration-200"
              >
                {downloadingQr ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Downloading...
                  </span>
                ) : (
                  <>
                    <DownloadIcon fontSize="small" />
                    <span>Download</span>
                  </>
                )}
              </button>
              <button
                onClick={shareQrCode}
                disabled={sharingQr}
                className="flex-1 py-3 cursor-pointer flex items-center justify-center gap-1 bg-gray-800 text-white rounded-[12px] font-medium hover:bg-gray-900 transition-all text-sm disabled:opacity-70 active:scale-95 duration-200"
              >
                {sharingQr ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Sharing...
                  </span>
                ) : (
                  <>
                    <ShareIcon fontSize="small" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center p-4 bg-white ">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-[12px] cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <ArrowBackIosIcon className="text-xl" />
          </button>
          <h1 className="text-lg font-medium mx-auto pr-8">Track Order</h1>
        </div>
        <OrderDetailSkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center p-4 bg-white ">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-[12px] cursor-pointer active:scale-95 transition-transform duration-200  "
          >
            <ArrowBackIosIcon className="text-xl" />
          </button>
          <h1 className="text-lg font-medium mx-auto pr-8">Order Details </h1>
        </div>
        <div className="p-4 bg-white text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchOrderDetails}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-[12px] hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const orderSteps = getOrderSteps();

  return (
    <div className="min-h-screen bg-gray-50 px-2">
      {/* Header */}
      <div className="flex items-center p-3 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-[12px] cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-base font-medium mx-auto pr-8">
          Track Order{" "}
          {/* <span className="text-[#FF583A]">#{orderData?.orderSequenceId}</span> */}
        </h1>
      </div>

      {orderData && (
        <>
          {/* Restaurant Info */}
          <div className="bg-white p-2 mt-2 rounded-[12px] border border-gray-200">
            <div className="flex items-center mb-2">
              {orderData.outletId?.logo && (
                <img
                  src={orderData.outletId.logo}
                  alt={orderData.outletId?.outletName}
                  className="w-12 h-12 rounded-[12px] mr-3 object-cover"
                />
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {orderData.outletId?.outletName}
                </h3>
                <p className="text-xs text-gray-500">
                  {orderData.outletId?.address}
                </p>
              </div>
            </div>
          </div>

          {/* OTP Section - Only show if order is not cancelled */}
          {orderData.orderStatusId?.orderStatusId !== -1 &&
            orderData.orderStatusId?.orderStatusId !== -2 && (
              <div className="bg-white p-4 mb-3 rounded-[12px] mt-3 border border-gray-200">
                <div className={`flex justify-between items-center ${orderData?.isMessOrder ? "flex-col" : ""}`}>
                  <div>
                    {!orderData?.isMessOrder && (
                      <>
                        <p className="text-sm text-gray-700 mb-1">
                          OTP -{" "}
                          <span className="text-[#FF583A] font-semibold">
                            {orderData.orderOTP}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          For any queries, please call{" "}
                          <a
                            href={`tel:${orderData.outletId?.mobile}`}
                            className="text-[#5046E5]"
                          >
                            {orderData.outletId?.mobile}
                          </a>
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!orderData?.isMessOrder && (
                      <>
                        <button
                          onClick={() => openQrView()}
                          className="p-2 rounded-[12px] bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-85 transition-transform duration-200"
                        >
                          <QrCodeIcon className="text-gray-700" />
                        </button>
                        <button
                          onClick={() => copyOTP(orderData.orderOTP)}
                          className="p-2 rounded-[12px] bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-85 transition-transform duration-200"
                        >
                          <ContentCopyIcon className="text-gray-700" />
                        </button>
                      </>
                    )}

                    {orderData?.isMessOrder && !orderData?.isCashOrder && (
                      <button
                        onClick={() => {
                          setShowQRCode(true);
                          // For mess orders, ensure we have the menu data and connect socket
                          if (
                            orderData?.isMessOrder &&
                            !messMenu &&
                            !loadingMessMenu
                          ) {
                            fetchMessMenu();
                          }
                          // Connect socket for real-time updates
                          if (orderData?.isMessOrder && user?.customerAuthUID) {
                            connectSocket(user.customerAuthUID);
                          }
                        }}
                        disabled={
                          orderData?.orderStatusId?.orderStatusId === 10 ||
                          loadingMessMenu ||
                          orderData?.orderStatusId?.orderStatusId === -1 ||
                          orderData?.orderStatusId?.orderStatusId === -2
                        }
                        className={`bg-[#FF583A] text-white px-3 py-3 rounded-[12px] flex items-center text-sm transition-all duration-300 hover:bg-[#e64d33] active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {loadingMessMenu ? (
                          <>
                            <span className="mr-1.5">Loading Menu Data</span>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          </>
                        ) : orderData?.orderStatusId?.orderStatusId === 10 ? (
                          <>
                            <span className="mr-1.5">Meal Already Served</span>
                            <QrCodeIcon fontSize="small" />
                          </>
                        ) : (
                          <>
                            <span className="mr-1.5">Display QR Code</span>
                            <QrCodeIcon fontSize="small" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Order Status */}
          {!orderData?.isMessOrder && (
            <div className="bg-white p-4 rounded-[12px] border border-gray-200 mt-3">
              <div className="relative">
                {getOrderSteps().map((step, index) => {
                  const isActive =
                    orderData.orderStatusId?.orderStatusId === -1 ||
                    orderData.orderStatusId?.orderStatusId === -2
                      ? index <= 1
                      : index <= getCurrentStepIndex();

                  const isLastStep = index === getOrderSteps().length - 1;

                  const isCancelledStep =
                    (orderData.orderStatusId?.orderStatusId === -1 ||
                      orderData.orderStatusId?.orderStatusId === -2) &&
                    index === 1;

                  return (
                    <div key={step.id} className="flex mb-8 last:mb-0 relative">
                      <div className="z-10">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isCancelledStep
                              ? "bg-red-500 text-white"
                              : isActive
                              ? "bg-[#5046E5] text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {isActive ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            isCancelledStep
                              ? "text-red-500"
                              : isActive
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {step.description}
                        </p>
                      </div>
                      {!isLastStep && (
                        <div
                          className={`absolute left-2.5 top-8 w-0.5 h-14 transition-colors ${
                            index < getCurrentStepIndex()
                              ? orderData.orderStatusId?.orderStatusId === -1 ||
                                orderData.orderStatusId?.orderStatusId === -2
                                ? index === 0
                                  ? "bg-red-500"
                                  : "bg-[#5046E5]"
                                : "bg-[#5046E5]"
                              : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Type & Schedule */}
          <div className="bg-white p-4 mb-3 mt-3 rounded-[12px] border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-700">Order Type</p>
              <p className="text-sm font-medium text-gray-900">
                {orderData.isDineIn
                  ? "Dine In"
                  : orderData.isPickUp
                  ? "Pick Up"
                  : orderData.isDelivery
                  ? "Delivery"
                  : "N/A"}
              </p>
            </div>
           
            {orderData.Order_Schedule?.[0] && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">Schedule Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(
                    `${orderData.Order_Schedule[0].scheduleDate} ${orderData.Order_Schedule[0].scheduleTime}`
                  ).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}
          </div>

          {orderData.isDelivery && orderData.DeliveryAddress?.[0]?.address && (
              <div className="flex items-center mb-3 bg-white p-4 rounded-[12px] border border-gray-200">
                <div className="text-sm font-normal text-gray-900 text-left max-w-xs break-words">
                  Address: <span className="text-gray-500">{orderData.DeliveryAddress[0].address}</span>
                </div>
              </div>
            )}

          {/* Order Items */}
          <div className="bg-white p-4 mb-3 rounded-[12px] border border-gray-200">
            <h3 className="text-sm font-medium mb-4 text-gray-900">
              {orderData.Order_Item?.length || 0} ITEMS IN ORDER
            </h3>

            {orderData.Order_Item?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {item.Menu_Item?.item_image_url && (
                    <img
                      src={item.Menu_Item.item_image_url}
                      alt={item.Menu_Item.itemname}
                      className="w-10 h-10 rounded-[12px] object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.Menu_Item?.itemname}
                      {item.Variation && ` (${item.Variation.name})`}
                    </p>
                    {/* Show Addons if exists */}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Addons:{" "}
                        {item.addons.map((addon) => addon.name).join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹
                    {item.Variation
                      ? item.Variation.price
                      : item.calculatedPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-4 rounded-[12px] mb-2 border border-gray-200">
            <h3 className="text-sm font-medium mb-4 text-gray-900">
              Bill Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <p>Item Total</p>
                <p>₹{orderData.Transaction?.itemTotalPrice}</p>
              </div>

              {orderData.Transaction?.foodGST > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <p>GST</p>
                  <p>₹{orderData.Transaction.foodGST}</p>
                </div>
              )}

              {orderData.Transaction?.packagingCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <p>Packaging Charges</p>
                  <p>₹{orderData.Transaction.packagingCharge}</p>
                </div>
              )}

              {orderData.Transaction?.deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <p>Delivery Charges</p>
                  <p>₹{orderData.Transaction.deliveryCharge}</p>
                </div>
              )}

              {orderData.Transaction?.convenienceTotalAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <p>Convenience Fee</p>
                  <p>₹{orderData.Transaction.convenienceTotalAmount}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between font-medium text-gray-900">
                  <p className="text-sm">Total Amount</p>
                  <p className="text-sm">₹{orderData.totalPrice.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paid via{" "}
                  {orderData.paymentType === "online"
                    ? "Online Payment"
                    : "Cash"}
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button - Only show if order is still in initial state */}
          {/* Outlet order - Show cancel button if status is 0 or 1 */}
          {!orderData?.isMessOrder &&
            (orderData?.orderStatusId?.orderStatusId === 0 ||
              orderData?.orderStatusId?.orderStatusId === 1) && (
              <div className="p-4 bg-white mb-10 border border-gray-200 rounded-[12px]">
                <div className="max-w-lg mx-auto">
                  <button
                    onClick={openCancelModal}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-[12px] text-sm font-medium hover:bg-red-100 cursor-pointer active:scale-95 transition-transform duration-200"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          {/* Mess order - Show cancel button if status is not -1 and not -2 */}

          {orderData?.isMessOrder &&
            orderData?.orderStatusId?.orderStatusId !== -1 &&
            orderData?.orderStatusId?.orderStatusId !== -2 && orderData?.orderStatusId?.orderStatusId !== 10 && (
              <div className="p-4 bg-white mb-10 border border-gray-200 rounded-[12px]">
                <div className="max-w-lg mx-auto">
                  <button
                    onClick={openCancelModal}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-[12px] text-sm font-medium hover:bg-red-100 cursor-pointer active:scale-95 transition-transform duration-200"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
        </>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Dialog
        open={cancelModalOpen}
        onClose={!cancelLoading ? closeCancelModal : undefined}
        aria-labelledby="cancel-order-dialog-title"
        PaperProps={{
          style: {
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
          },
        }}
      >
        <DialogTitle
          id="cancel-order-dialog-title"
          sx={{
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 24px",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Cancel Order</span>
            {!cancelLoading && (
              <IconButton
                edge="end"
                color="inherit"
                onClick={closeCancelModal}
                aria-label="close"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          <div className="flex flex-col items-center text-center mb-4 mt-10">
            <div className="bg-red-50 p-3 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-base font-medium mb-2">
              Are you sure you want to cancel this order?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone and may affect your meal
              availability.
            </p>
          </div>
        </DialogContent>
        <DialogActions
          sx={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}
        >
          <div className="flex md:flex-row flex-col w-full gap-3">
            <Button
              onClick={closeCancelModal}
              disabled={cancelLoading}
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                padding: "8px 16px",
              }}
            >
              No, Keep Order
            </Button>
            <Button
              onClick={cancelOrder}
              color="error"
              disabled={cancelLoading}
              variant="contained"
              fullWidth
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                padding: "8px 16px",
                boxShadow: "none",
              }}
            >
              {cancelLoading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Cancelling...
                </div>
              ) : (
                "Yes, Cancel Order"
              )}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#323232",
            color: "#fff",
            minWidth: "auto",
            borderRadius: "12px",
            padding: "6px 16px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "& .MuiSnackbarContent-message": {
              padding: "8px 0",
              fontSize: "14px",
            },
          },
          "& .MuiSnackbarContent-action": {
            paddingLeft: "16px",
          },
        }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* QR Code Modal */}
      {showQrCode && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <div className="bg-white p-5 rounded-2xl w-10/12 max-w-sm relative shadow-2xl border border-gray-100 animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => {
                setShowQRCode(false);
                // Ensure socket is disconnected when modal is closed
                if (orderData?.isMessOrder) {
                  disconnectSocket();
                }
              }}
              className="absolute text-gray-500 hover:text-gray-800 right-4 top-3 hover:cursor-pointer active:scale-95 transition-transform duration-200 bg-gray-100 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ×
            </button>

            <div className="flex flex-col items-center justify-center mb-2 rounded-xl p-4">
              <div className="flex items-center mb-4 bg-[#FF583A] text-white px-4 py-2 rounded-[12px] shadow-md">
                <p className="text-sm font-medium">
                  {orderData?.Order_Item[0]?.Menu_Item?.itemname}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl shadow-md">
                {orderData?.isMessOrder && loadingMessMenu ? (
                  <div className="flex items-center justify-center h-[180px] w-[180px]">
                    <div className="w-8 h-8 border-4 border-[#FF583A] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <QRCodeSVG
                    value={generateQrData(orderData?.Order_Item[0]?.itemId)}
                    size={180}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    className="qr-code-svg"
                  />
                )}
              </div>
              
              {orderData?.isMessOrder ? (
                <div className="text-center mt-3">
                  <p className="text-gray-600 text-xs">
                    Scan to access your meal
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Waiting for server to scan...
                  </p>
                  {!loadingMessMenu && !messMenu && !messMenuError && (
                    <button
                      onClick={fetchMessMenu}
                      className="text-[#FF583A] text-xs mt-1 underline"
                    >
                      Retry loading menu data
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-xs mt-3 text-center">
                  Scan to verify your order
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
