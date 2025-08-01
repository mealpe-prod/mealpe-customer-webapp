import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useSelector } from "react-redux";

const Orders = () => {
  const user = useSelector((state) => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(1, true);
  }, [user?.customerAuthUID]);

  const fetchOrders = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      if (!user?.customerAuthUID) {
        setError("You need to be logged in to view orders");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BACKEND_BASE_URL
        }order/order/v2/getOrderByCustomerAuthId/${user?.customerAuthUID}`,
        {
          params: {
            page: pageNum,
            perPage: 10,
          },
        }
      );

      if (response.data.success) {
        const { data, metadata } = response.data;

        if (reset) {
          setOrders(data);
        } else {
          setOrders((prev) => [...prev, ...data]);
        }

        // Check if there are more pages
        if (metadata?.pagination) {
          setHasMore(metadata.pagination.page < metadata.pagination.totalPages);
        } else {
          setHasMore(false);
        }

        setPage(pageNum);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("An error occurred while fetching your orders");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreOrders = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1);
    }
  };

  // Helper function to get status badge color based on order status
  const getStatusBadge = (orderStatus) => {
    if (!orderStatus)
      return { bg: "bg-gray-100", text: "text-gray-800", label: "UNKNOWN" };

    const { text, orderStatusId } = orderStatus;

    // Status mapping based on the API response
    if (orderStatusId === 10) {
      return { bg: "bg-green-100", text: "text-green-700", label: "SUCCESS" };
    } else if (orderStatusId === 0) {
      return { bg: "bg-blue-100", text: "text-[#5046E5]", label: "LIVE" };
    } else if (orderStatusId === -1) {
      return { bg: "bg-red-100", text: "text-red-700", label: "CANCELLED" };
    } else if (orderStatusId === -2) {
      return { bg: "bg-red-100", text: "text-red-700", label: "REJECTED" };
    } else {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: text || "PROCESSING",
      };
    }
  };

  // Format date and time from the API response
  const formatDateTime = (scheduleDate, scheduleTime) => {
    if (!scheduleDate || !scheduleTime) return "N/A";

    // Convert 24hr time to 12hr format with AM/PM
    let hours = parseInt(scheduleTime.substring(0, 2));
    const minutes = scheduleTime.substring(3, 5);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${scheduleDate}, ${formattedTime}`;
  };

  // Skeleton loader component for orders
  const OrderSkeletonLoader = () => {
    return (
      <div className="bg-white rounded-[12px] border border-gray-200 p-4 animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-5 bg-gray-200 rounded-lg w-20"></div>
        </div>

        <div className="h-3 bg-gray-200 rounded w-40 mb-4"></div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  };

  // Empty Orders Screen Component
  const EmptyOrdersScreen = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 mt-38 md:mt-20">
        {/* Empty Orders Icon */}
        <div className="w-[110px] h-[110px] rounded-[12px] bg-white shadow-md flex items-center justify-center mb-6">
          <ReceiptLongIcon style={{ fontSize: "45px", color: "#FF583A" }} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-sm text-gray-500">
            Your order history will appear here
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 bg-white w-full shadow-sm">
        <button
          onClick={() => navigate("/home")}
          className="p-1 rounded-lg cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">My Orders</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map((item) => (
              <OrderSkeletonLoader key={item} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchOrders(1, true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark active:scale-95 transition-transform duration-200"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrdersScreen />
        ) : (
          <div className="flex flex-col space-y-2">
            {orders.map((order, index) => {
              const statusBadge = getStatusBadge(order.orderStatusId);
              const isLastOrder = index === orders.length - 1 && !hasMore;
              const scheduleInfo = order.Order_Schedule?.[0];

              return (
                <div
                  key={order.orderId}
                  className={`bg-white rounded-[12px] border border-gray-200 p-4 ${
                    isLastOrder ? "mb-8" : ""
                  } cursor-pointer active:scale-95 transition-transform duration-200`}
                  onClick={() => navigate(`/order/${order.orderId}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {order.outletId?.logo && (
                        <img
                          src={order.outletId.logo}
                          alt={order.outletId?.outletName}
                          className="w-10 h-10 rounded-lg mr-3 object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-sm text-gray-800">
                          {order.outletId?.outletName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Order ID: #{order.orderSequenceId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs rounded-[12px] font-medium`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <p>
                      {scheduleInfo
                        ? formatDateTime(
                            scheduleInfo.scheduleDate,
                            scheduleInfo.scheduleTime
                          )
                        : "N/A"}
                    </p>
                    {order.isDineIn && (
                      <span className="text-primary">• Dine In</span>
                    )}
                    {order.isPickUp && (
                      <span className="text-primary">• Pick Up</span>
                    )}
                    {order.isDelivery && (
                      <span className="text-primary">• Delivery</span>
                    )}
                  </div>

                  {/* <div className="border-t border-gray-100 pt-3">
                    {order.Order_Item && order.Order_Item.map((item, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">{item.quantity} x Item</p>
                          <p className="text-xs text-gray-500">₹{item.itemPrice}</p>
                        </div>
                      </div>
                    ))}
                  </div> */}
                  <div
                    className="w-full flex justify-end"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/review`,{state: {order}});
                    }}
                  >
                    {order?.orderStatusId?.orderStatusId === 10 && (
                      <button className="text-sm rounded-full bg-black/80 text-white px-3 py-2 cursor-pointer active:scale-95 transition-all duration-300">
                        Share Review
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <p>
                        {order.paymentType === "cash"
                          ? "Cash Payment"
                          : "Wallet Payment"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹{order.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  {(order.orderStatusId?.orderStatusId === -1 ||
                    order.orderStatusId?.orderStatusId === -2) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <p>
                        Payment Amount will be refunded to your original payment
                        method in 2-3 Working days
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-4 mb-8">
                <button
                  onClick={loadMoreOrders}
                  disabled={loadingMore}
                  className="px-6 py-2 border border-[#FF583A] text-[#FF583A] rounded-[12px] hover:bg-[#FFF1EE] active:scale-95 transition-transform duration-300 cursor-pointer disabled:bg-[#FFF1EE] disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center mt-4 mb-8">
                <div className="flex flex-col space-y-4">
                  <OrderSkeletonLoader />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
