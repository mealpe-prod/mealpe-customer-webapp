import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Toast from '../../components/Toast';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';

const OrderReview = () => {
  const { order } = useLocation().state;
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const ratingEmojis = {
    1: '😞',
    2: '😐',
    3: '🙂',
    4: '😊',
    5: '😍'
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleImageUpload = async (e) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        if (images.length + newImages.length >= 3) {
          Toast.info('Maximum 3 images allowed');
          break;
        }
        
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          Toast.error('Image size should be less than 5MB');
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push(event.target.result);
          if (i === files.length - 1 || images.length + newImages.length >= 3) {
            setImages(prev => [...prev, ...newImages]);
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Toast.error('Failed to upload images');
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const reviewData = {
        customerAuthUID: user.customerAuthUID,
        outletId: order.outletId?.outletId,
        message: review,
        star: rating,
        orderId: order.orderId,
        images: images
      };

      console.log({reviewData})

      if(images?.length > 0){
        const formData = new FormData();
        images.forEach((img, idx) => {
          // If images are base64 strings, convert to Blob
          if (typeof img === "string" && img.startsWith("data:")) {
            const arr = img.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            formData.append("images", new Blob([u8arr], { type: mime }), `image${idx}.jpg`);
          } else {
            // If already a File/Blob
            formData.append("images", img);
          }
        });
        formData.append("orderId", order.orderId);

        const uploadImage = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}rating/rating/uploadReviewImages`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("uploaded image", uploadImage);
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}rating/rating/addOrderReview`,
        reviewData
      );

      
      
      if (response.data.success) {
        Toast.success('Review submitted successfully!');
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/orders');
        }, 500);
      } else {
        Toast.error('Rating Already Submitted');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Restaurant Image with Back Button */}
        <div className="w-full h-40 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
          <img 
            src={order?.outletId?.headerImage || order?.outletId?.logo} 
            alt={order?.outletId?.outletName} 
            className="w-full h-full object-cover"
          />
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate("/orders")}
            className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer shadow-md active:scale-95 transition-transform duration-200"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
          {order?.outletId?.logo && order?.outletId?.headerImage && (
            <div className="absolute bottom-[10px] left-[45px] transform -translate-x-1/2 z-30">
              <img 
                src={order?.outletId?.logo} 
                alt={`${order?.outletId?.outletName} logo`} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="text-center mb-2 mt-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">{order?.outletId?.outletName}</h2>
          {/* <p className="text-sm text-gray-500 mt-1">Order #{order?.orderId?.slice(-6)}</p> */}
        </div>

        {/* Rating Section */}
        <div className="mb-6 px-4 bg-white rounded-xl shadow-sm py-6 mx-4 mt-2">
          <h3 className="text-base md:text-lg font-semibold text-center mb-3">How was your experience?</h3>
          
          {/* Star Rating */}
          <div className="flex justify-center space-x-3 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingChange(star)}
                className={`text-2xl md:text-3xl transition-all duration-300 ${
                  star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                } hover:scale-110`}
              >
                ★
              </button>
            ))}
          </div>
          
          {/* Rating Label */}
          <p className="text-center text-base md:text-lg font-medium text-[#FF583A]">
            {ratingLabels[rating]} {ratingEmojis[rating]}
          </p>
        </div>

        {/* Review Text Area */}
        <div className="mb-4 px-4">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 ml-1">
            Share your thoughts
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you liked or didn't like about your order..."
            className="w-full h-28 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF583A] bg-white shadow-sm text-sm"
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-6 px-4">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 ml-1">
            Add photos of your food (optional)
          </label>
          
          {/* Image Preview */}
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((image, index) => (
              <div key={index} className="relative w-20 h-20">
                <img 
                  src={image} 
                  alt={`Food ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute -top-3 -right-2 rounded-full p-0.5 active:scale-95 transitiona-all duration-300 cursor-pointer"
                >
                  <CancelIcon style={{ fontSize: '16px', color: '#FF583A' }} />
                </button>
              </div>
            ))}
            
            {uploading && (
              <div className="w-20 h-20 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#FF583A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Upload Buttons */}
          {images.length < 3 && !uploading && (
            <div className="flex gap-2">
              {/* Camera Button */}
              <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-95 transition-all duration-200">
                <CameraAltIcon style={{ fontSize: '18px', color: '#FF583A' }} />
                <span className="text-xs font-medium">Camera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              
              {/* Gallery Button */}
              <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-95 transition-all duration-200">
                <AddPhotoAlternateIcon style={{ fontSize: '18px', color: '#FF583A' }} />
                <span className="text-xs font-medium">Gallery</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                  className="hidden"
                />
              </label>
            </div>
          )}
          
          {images.length >= 3 && (
            <p className="text-xs text-gray-500 text-center mt-1">Maximum 3 images allowed</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="px-4 mb-6">
          <button
            onClick={handleSubmit}
            disabled={loading || uploading || images?.length > 3}
            className={`w-full py-3 bg-[#FF583A] text-white rounded-[12px] text-sm md:text-base font-medium cursor-pointer active:scale-95 transition-all duration-300 disabled:bg-opacity-70 disabled:bg-[#FF583A] shadow-sm shadow-[#FF583A]/30 ${images?.length > 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default OrderReview;
