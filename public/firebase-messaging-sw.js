// Firebase Service Worker for handling background messages
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDtxlC-kaN-5S8nMXqADFhErdWg_P5DzNY",
  authDomain: "mealpe-93b10.firebaseapp.com",
  projectId: "mealpe-93b10",
  storageBucket: "mealpe-93b10.appspot.com",
  messagingSenderId: "405625215860",
  appId: "1:405625215860:web:2518d4379e162d1fb36a21",
  measurementId: "G-KWYPXV1FKZ",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Prevent default notification by returning early if notification is present
  if (payload.notification) {
    // Extract data for custom notification
    const notificationTitle = payload.notification.title || "New Notification";
    const notificationOptions = {
      body: payload.notification.body || "Background message received",
      icon: "./icons/icon-512x512.png",
      badge: "./icons/icon-512x512.png",
      data: {
        url: payload.data?.url || "/", // URL to redirect when clicked
        ...payload.data
      },
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Get the URL from notification data or default to home page
  const urlToOpen = event.notification.data?.url || '/';
  
  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if any client (tab/window) is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to the specific URL and focus the existing tab
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // If no existing window/tab is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
});