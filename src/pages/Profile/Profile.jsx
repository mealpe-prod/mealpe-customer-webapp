import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import axios from "axios";
import CustomInput from "../../components/CustomInput";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";
import DummyImage from "../../assets/mealpe.png";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import EditIcon from "@mui/icons-material/Edit";

// Skeleton components
const SkeletonInput = () => (
  <div>
    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
    <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

const SkeletonProfileSection = () => (
  <div className="space-y-4">
    <SkeletonProfileImage />
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="py-2 px-4 rounded-[12px] bg-gray-200 animate-pulse h-8"></div>
      ))}
    </div>
    {[1, 2, 3, 4].map((item) => (
      <SkeletonInput key={item} />
    ))}
    <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mt-6"></div>
  </div>
);

const SkeletonProfileImage = () => (
  <div className="flex justify-start mb-6">
    <div className="relative">
      <div className="w-20 h-20 bg-gray-200 rounded-[12px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 bg-gray-300 rounded-[12px] p-1 animate-pulse w-5 h-5"></div>
    </div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Photo upload states
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Gender state
  const [genders, setGenders] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    genderId: "",
    campusId: "",
  });

  // Form validation state
  const [validation, setValidation] = useState({
    name: true,
    email: true,
    phone: true,
  });

  // Fetch genders on component mount
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}common/getGender`);
        if (response.data.success) {
          setGenders(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching genders:', error);
        Toast.error('Failed to load gender options');
      }
    };

    fetchGenders();
  }, []);

  // Initialize data from Redux when component mounts
  useEffect(() => {
    setDataLoading(true);

    if (userData) {
      setFormData({
        name: userData.customerName || "",
        email: userData.email || "",
        phone: userData.mobile || "",
        dob: userData.dob || "",
        genderId: userData.genderId || "",
        campusId: userData.campusId?.campusId || null,
      });

      if (userData.photo) {
        setPhotoPreview(userData.photo);
      }
    }
    setDataLoading(false);
  }, [userData]);

  // Handle photo upload from gallery
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Check file size (2MB limit)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 2) {
      Toast.error("Image file is too large. Please select an image smaller than 2MB.");
      return;
    }

    try {
      setPhotoLoading(true);
      
      if (!userData.customerAuthUID) {
        throw new Error("User ID not found");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerAuthUID", userData.customerAuthUID);

      // Upload photo
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/upsertUserImage`,
        formData
      );

      if (response.data.success) {
        // Update local state and Redux with new photo URL
        const newPhotoUrl = response.data.data.photo;
        setPhotoPreview(newPhotoUrl);
        dispatch(setUser({ ...userData, photo: newPhotoUrl }));
        Toast.success("Profile photo updated successfully!");
      } else {
        throw new Error(response.data.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Toast.error(error.message || "Failed to upload photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation errors when user types
    if (!validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: true
      }));
    }

    // Special validation for phone field
    if (name === 'phone') {
      const isValid = value.length === 10 || value.length === 11 || (userData && value === userData.mobile);
      setValidation(prev => ({
        ...prev,
        phone: isValid
      }));
    }
  };

  // Handle gender selection
  const handleGenderSelect = (genderId) => {
    setFormData((prev) => ({
      ...prev,
      genderId: genderId,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newValidation = {
      name: !!formData.name.trim(),
      email: !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      phone: formData.phone.length === 10 || formData.phone.length === 11
    };
    
    // If phone is the same as the original user data, consider it valid
    if (userData && formData.phone === userData.mobile) {
      newValidation.phone = true;
    }
    
    setValidation(newValidation);
    return Object.values(newValidation).every(isValid => isValid);
  };

  const handleUpdate = async () => {
    // Validate form before submission
    if (!validateForm()) {
      Toast.error("Please correct the errors in the form");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!userData.customerAuthUID) {
        setError("Authentication token not found. Please log in again.");
        Toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // Update profile information
      const updateData = {
        customerName: formData.name,
        email: formData.email,
        mobile: formData.phone,
        dob: formData.dob,
        genderId: formData.genderId,
        campusId: userData.campusId?.campusId || null
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/updateCustomer/${userData.customerAuthUID}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
       // Update Redux store with new data
        dispatch(
          setUser({
            ...userData,
            ...response.data.data,
          })
        );
        Toast.success("Profile updated successfully!");
      } else {
        setError(response.data.message || "Failed to update profile");
        Toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error in update process:", error);
      if (error.message === "Network Error") {
        setError("Network error occurred. Please check your connection.");
        Toast.error("Network error occurred. Please check your connection.");
      } else {
        setError(error.response?.data?.message || "An unexpected error occurred");
        Toast.error(error.response?.data?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Track if form has been modified
  const [isFormModified, setIsFormModified] = useState(false);
  
  // Check if form has been modified
  useEffect(() => {
    if (userData) {
      const isModified = 
        formData.name !== (userData.customerName || "") ||
        formData.email !== (userData.email || "") ||
        formData.dob !== (userData.dob || "") ||
        formData.genderId !== (userData.genderId || "");
      
      setIsFormModified(isModified);
    }
  }, [formData, userData]);

  // Handle back navigation with confirmation if form modified
  const handleBackNavigation = () => {
    if (isFormModified) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
        <button 
          onClick={handleBackNavigation} 
          className="p-1 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Edit Profile</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {dataLoading ? (
          <SkeletonProfileSection />
        ) : (
          <>
            {/* Profile Photo */}
            <div className="flex justify-start mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                  {photoLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader color="primary" size="small" />
                    </div>
                  ) : (
                    <img
                      src={photoPreview || userData?.photo || DummyImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DummyImage;
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="absolute bottom-0 right-0 p-1 rounded-full shadow-md cursor-pointer disabled:opacity-10 active:scale-95 transition-transform duration-200"
                  aria-label="Change profile photo"
                >
                  <EditIcon className="text-white w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {genders.map((genderOption) => (
                <button
                  key={genderOption.genderId}
                  onClick={() => handleGenderSelect(genderOption.genderId)}
                  className={`py-1.5 px-1 rounded-[12px] text-sm font-medium transition-all cursor-pointer active:scale-95 duration-300 ${
                    formData.genderId === genderOption.genderId
                      ? "bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A]"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {genderOption.gender}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4 bg-white p-4 rounded-[12px] shadow-sm">
              <div className="relative">
                <CustomInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`bg-white text-sm ${!validation.name ? 'border-red-500' : formData.name !== (userData?.customerName || "") ? 'border-[#FF583A] bg-[#FFF1EE]' : ''}`}
                  required
                />
                {!validation.name && <p className="text-red-500 text-xs mt-1">Name is required</p>}
              </div>

              <div className="relative">
                <CustomInput
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  // readOnly={formData.phone?.length === 10 ? true : false}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={`bg-white text-sm ${
                    formData.phone?.length === 10 || (userData && formData.phone === userData.mobile)
                      ? "bg-gray-50 cursor-not-allowed border border-gray-200" 
                      : !validation.phone ? 'border-red-500' : ''
                  }`}
                  required
                />
                {!validation.phone && <p className="text-red-500 text-xs mt-1">Valid phone number is required</p>}
                {(formData.phone?.length === 10 || (userData && formData.phone === userData.mobile)) && 
                  <span className="absolute right-3 top-9 text-green-500">✓</span>}
              </div>

              <div className="relative">
                <CustomInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`bg-white text-sm ${!validation.email ? 'border-red-500' : formData.email !== (userData?.email || "") ? 'border-[#FF583A] bg-[#FFF1EE]' : ''}`}
                />
                {!validation.email && <p className="text-red-500 text-xs mt-1">Please enter a valid email</p>}
              </div>

              <div className="relative">
                <CustomInput
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`bg-white text-sm ${formData.dob !== (userData?.dob || "") ? 'border-[#FF583A] bg-[#FFF1EE]' : ''}`}
                />
              </div>
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={loading || !isFormModified}
              className={`w-full mt-6 text-white text-sm rounded-[12px] cursor-pointer px-4 py-2.5 gap-[10px] font-medium transition-all active:scale-95 duration-200 disabled:cursor-not-allowed flex items-center justify-center ${
                isFormModified 
                  ? "bg-[#FF5B37] border border-[#FF5B37] hover:bg-[#ff4520] disabled:opacity-50" 
                  : "bg-gray-400 border border-gray-400 disabled:opacity-70"
              }`}
            >
              {loading ? <Loader /> : isFormModified ? "Update profile" : "No changes to save"}
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
