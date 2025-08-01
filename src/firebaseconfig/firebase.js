// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyDtxlC-kaN-5S8nMXqADFhErdWg_P5DzNY",
  authDomain: "mealpe-93b10.firebaseapp.com",
  projectId: "mealpe-93b10",
  storageBucket: "mealpe-93b10.appspot.com",
  messagingSenderId: "405625215860",
  appId: "1:405625215860:web:2518d4379e162d1fb36a21",
  measurementId: "G-KWYPXV1FKZ",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Cloud Messaging and get a reference to the service worker
export const messaging = getMessaging(app);

export const generateToken = async () => {
  try {
    // Grant the permission to receive notifications
    const permission = await Notification.requestPermission();
    console.log("permission", permission);
    if (permission === "granted") {
      // Get the token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY,
      });
      
      if (token) {
        // Get the customer auth UID from local storage or wherever it's stored
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (user?.customerAuthUID) {
          // Call the API to save the FCM token
          const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/storeFcmToken`, {
            customerAuthUID: user?.customerAuthUID,
            appName:"MealPeWebApp",
            fcmToken: token
          });
          
          return response;
        } else {
          console.error("Customer auth UID not found");
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating FCM token:", error);
    return null;
  }
}

// Handle foreground messages
export const setupForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground. ', payload);
    
    // Create custom notification when app is in foreground
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'Foreground message received',
        icon: './icons/icon-512x512.png',
        badge: './icons/icon-512x512.png',
        data: payload.data || {},
        requireInteraction: true
      };
      
      const notification = new Notification(notificationTitle, notificationOptions);
      
      // Handle click on foreground notification
      notification.onclick = function(event) {
        event.preventDefault();
        notification.close();
        
        // Focus window and navigate if needed
        window.focus();
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };
    }
  });
};

export default app;