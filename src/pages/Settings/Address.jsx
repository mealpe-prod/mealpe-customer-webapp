import React, { useState, useEffect } from "react";
import { MapPin, Home, Building } from "lucide-react";
import { useSelector } from "react-redux";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import CustomInput from "../../components/CustomInput";
import axios from "axios";
import Toast from "../../components/Toast";
import PlusIcon from "@mui/icons-material/Add";

export default function AddAddressScreen() {
  const { customerAuthUID } = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [addAddress, setAddAddress] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [formData, setFormData] = useState({
    customerAuthUID: customerAuthUID,
    label: "",
    address_line_1: "",
    address_line_2: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    delivery_instructions: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = "Please select an address label";
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = "Address line 1 is required";
    if (!formData.locality.trim()) newErrors.locality = "Locality is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Please enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let response;
      if (isEditMode && editingAddressId) {
        response = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/updateCustomerAddress/${editingAddressId}`,
          formData
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/addCustomerAddress`,
          formData
        );
      }

      if (response.status === 200) {
        Toast.success(isEditMode ? "Address updated successfully!" : "Address added successfully!");
        resetForm();
        fetchAddressList();
      } else {
        Toast.error("Failed to save address. Please try again.");
      }
    } catch (error) {
      Toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAddAddress(false);
    setIsEditMode(false);
    setEditingAddressId(null);
    setFormData({
      customerAuthUID: customerAuthUID,
      label: "",
      address_line_1: "",
      address_line_2: "",
      locality: "",
      city: "",
      state: "",
      pincode: "",
      delivery_instructions: "",
    });
  };

  const fetchAddressList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/getCustomerAddresses/${customerAuthUID}`
      );
      if (response.status === 200) {
        setAddressList(response.data.data);

        if(response?.data?.data?.length === 0 ){
          setAddAddress(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  useEffect(() => {
    fetchAddressList();
  }, [customerAuthUID]);

  const addressLabels = [
    { id: "Home", icon: Home, label: "Home" },
    { id: "Work", icon: Building, label: "Work" },
    { id: "Other", icon: MapPin, label: "Other" },
  ];


  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center p-3 bg-white w-full shadow-sm z-50">
        <button
          onClick={() => navigate("/settings")}
          className="p-1 rounded-lg cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Address</h1>
      </div>

      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setAddAddress(true)}
          className="w-fit bg-[#FF583A] text-white text-sm font-medium py-2 px-4 rounded-[12px] transition-all cursor-pointer active:scale-95"
        >
          <PlusIcon className="w-2 h-2 mr-2" />
          Add Address
        </button>
      </div>

      <div className="max-w-full flex flex-wrap gap-4 p-4">
        {addressList.length === 0 ? (
          <div className="w-full flex items-center justify-center h-[30vh]">
            <div className="text-gray-500 text-center">No saved addresses found.</div>
          </div>
        ) : (
          addressList.map((address) => (
          <div
            key={address.customer_address_id}
            className="w-full bg-white rounded-[12px] shadow p-4 flex flex-col gap-2 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF583A]" />
                <span className="text-sm font-semibold text-gray-800">{address.label}</span>
              </div>
              <button
                onClick={() => {
                  setFormData(address);
                  setEditingAddressId(address.customer_address_id);
                  setIsEditMode(true);
                  setAddAddress(true);
                }}
                className="text-sm font-medium text-[#FF583A] hover:text-[#FF583A] cursor-pointer active:scale-95 transition-transform duration-200"
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-snug">
              <div>{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ""}</div>
              <div>{address.locality ? `${address.locality}, ` : ""}{address.city}, {address.state} - {address.pincode}</div>
            </div>
            {address.delivery_instructions && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Delivery Instructions:</span> {address.delivery_instructions}
              </div>
            )}
          </div>
        )))}
      </div>

      {addAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 overflow-y-auto max-h-[90vh] relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-lg cursor-pointer active:scale-95"
            >✕</button>

            <h2 className="text-lg font-semibold mb-4">{isEditMode ? "Edit Address" : "Add New Address"}</h2>

            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Save address as <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {addressLabels.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => handleInputChange("label", id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-[12px] border transition-all cursor-pointer active:scale-95 ${
                      formData.label === id ? "border-[#FF583A] bg-[#FF583A] text-white" : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {/* <Icon className="w-5 h-5 mb-2" /> */}
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
            </div>

            <div className="space-y-4">
              <CustomInput label="Address Line 1" name="address_line_1" value={formData.address_line_1} onChange={(e) => handleInputChange("address_line_1", e.target.value)} placeholder="Enter address line 1" className="bg-white text-sm" />
              {errors.address_line_1 && <p className="text-sm text-red-500">{errors.address_line_1}</p>}
              <CustomInput label="Address Line 2" name="address_line_2" value={formData.address_line_2} onChange={(e) => handleInputChange("address_line_2", e.target.value)} placeholder="Enter address line 2" className="bg-white text-sm" />
              <CustomInput label="Locality" name="locality" value={formData.locality} onChange={(e) => handleInputChange("locality", e.target.value)} placeholder="Enter locality" className="bg-white text-sm" />
              {errors.locality && <p className="text-sm text-red-500">{errors.locality}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CustomInput label="City" name="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} placeholder="City" className="bg-white text-sm" />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
                <div>
                  <CustomInput label="Pincode" name="pincode" value={formData.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} placeholder="123456" maxLength={6} className="bg-white text-sm" />
                  {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
                </div>
              </div>
              <CustomInput label="State" name="state" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} placeholder="Enter state" className="bg-white text-sm" />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              <CustomInput label="Delivery Instructions" name="delivery_instructions" value={formData.delivery_instructions} onChange={(e) => handleInputChange("delivery_instructions", e.target.value)} placeholder="Any specific instructions (optional)" rows={3} className="bg-white text-sm" />
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#FF583A] text-white font-medium py-3 px-6 rounded-[12px] transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditMode ? "Updating Address..." : "Saving Address..."}</span>
                  </div>
                ) : (
                  isEditMode ? "Update Address" : "Save Address"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
