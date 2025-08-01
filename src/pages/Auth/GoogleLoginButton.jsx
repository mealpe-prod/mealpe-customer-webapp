import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import GoogleIcon from "../../assets/google.png";
import app from "../../firebaseconfig/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";
import Toast from "../../components/Toast";

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
  
      const userName = result?.user?.displayName;
      const userEmail = result?.user?.email;
      const userPhoto = result?.user?.photoURL;
  
      if ((userName && userEmail) || (userPhoto)) {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/iosUserGooglelogin`,
          { name: userName, email: userEmail, photo: userPhoto }
        );
  
        console.log("✅ Backend Response:", response);
        
        if (response.data.success) {
          // Save user data to Redux store
          dispatch(setUser(response.data.data));
          
          // Show success message
          Toast.success("Login successful!");
          
          // Navigate to home page
          navigate("/home");
        } else {
          Toast.error(response.data.message || "Login failed");
          console.error("❌ Login failed:", response.data.message);
        }
      } else {
        Toast.error("No user information received from Google");
        console.error("❌ No user information received from Google.");
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || "Error during Google login");
      console.error("❌ Error during Google login or backend call:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button
        type="button"
        className="w-full h-[48px] flex items-center justify-center cursor-pointer px-6 py-2.5 gap-[10px] border border-gray-300 rounded-[12px] text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-transform duration-200"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loader">
              <div className="spinner">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
              </div>
            </div>
            <span className="ml-2">Signing in...</span>
          </div>
        ) : (
          <>
            <img src={GoogleIcon} className="h-5 w-5 mr-2" alt="" />
            Google
          </>
        )}
      </button>
      <style jsx>{`
        .loader {
          display: flex;
          align-items: center;
        }
        .spinner {
          display: flex;
          align-items: center;
        }
        .spinner > div {
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background-color: #FF583A;
          border-radius: 100%;
          display: inline-block;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }
        .spinner .bounce1 {
          animation-delay: -0.32s;
        }
        .spinner .bounce2 {
          animation-delay: -0.16s;
        }
        @keyframes sk-bouncedelay {
          0%, 80%, 100% { 
            transform: scale(0);
          } 
          40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </div>
  );
};

export default GoogleLoginButton;
