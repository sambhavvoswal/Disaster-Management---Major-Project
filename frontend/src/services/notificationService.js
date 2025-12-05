import { requestNotificationPermission, onMessageListener } from '../firebase';

class NotificationService {
  constructor() {
    this.notificationPermission = null;
    this.fcmToken = null;
    this.notificationCallbacks = [];
  }

  // Initialize notification service
  async initialize() {
    try {
      this.fcmToken = await requestNotificationPermission();
      this.notificationPermission = Notification.permission;
      
      // Listen for incoming messages
      onMessageListener().then((payload) => {
        this.handleIncomingMessage(payload);
      });
      
      return this.fcmToken;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return null;
    }
  }

  // Handle incoming notification
  handleIncomingMessage(payload) {
    const { notification, data } = payload;
    
    // Show notification
    if (notification) {
      this.showNotification(notification);
    }
    
    // Notify all subscribers
    this.notifySubscribers({
      type: 'push',
      title: notification?.title,
      message: notification?.body,
      data,
      timestamp: new Date()
    });
  }

  // Show browser notification
  showNotification({ title, body, icon = '/logo192.png' }) {
    if (this.notificationPermission !== 'granted') return;

    const options = {
      body,
      icon,
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: { dateOfArrival: Date.now() }
    };

    new Notification(title, options);
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers(notification) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  // Create a disaster notification
  createDisasterNotification(disaster, userLocation) {
    let title = '';
    let message = '';
    let icon = '⚠️';

    switch (disaster.type) {
      case 'earthquake':
        title = `🌍 ${disaster.magnitude?.toFixed(1)} Earthquake Detected`;
        message = `A ${disaster.magnitude?.toFixed(1)} magnitude earthquake occurred in ${disaster.place || 'an unknown location'}`;
        break;
      case 'flood':
        title = '🌊 Flood Warning';
        message = `Flood warning issued for ${disaster.place || 'your area'}`;
        icon = '🌊';
        break;
      case 'wildfire':
        title = '🔥 Wildfire Alert';
        message = `Wildfire detected near ${disaster.place || 'your area'}`;
        icon = '🔥';
        break;
      default:
        title = `⚠️ ${disaster.type || 'Disaster'} Alert`;
        message = `A ${disaster.type || 'disaster'} has been reported in ${disaster.place || 'your area'}`;
    }

    // Add distance if user location is available
    if (userLocation && disaster.lat && disaster.lng) {
      const distance = Math.round(calculateDistance(
        userLocation.lat,
        userLocation.lng,
        disaster.lat,
        disaster.lng
      ));
      message += ` - ${distance}km away`;
    }

    return { title, message, icon };
  }
}

// Helper function to calculate distance between coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export const notificationService = new NotificationService();
export default notificationService;
