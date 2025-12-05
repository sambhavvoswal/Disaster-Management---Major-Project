// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDp8gtj9xVnBt2S2RtQcoeqz7EtxQQ4pIs",
  authDomain: "disaster-management-cb73b.firebaseapp.com",
  projectId: "disaster-management-cb73b",
  storageBucket: "disaster-management-cb73b.firebasestorage.app",
  messagingSenderId: "132795340852",
  appId: "1:132795340852:web:e27b6bf250bb783107d261",
  measurementId: "G-058E79HLQD"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});