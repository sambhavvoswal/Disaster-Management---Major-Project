import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: false,
    inApp: true
  });
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPushSupported, setIsPushSupported] = useState('Notification' in window);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage or API
    const savedSettings = JSON.parse(localStorage.getItem('notificationSettings') || 'null');
    if (savedSettings) {
      setSettings(savedSettings);
    }
    
    // Check push notification permission
    if (isPushSupported) {
      setSettings(prev => ({
        ...prev,
        push: Notification.permission === 'granted'
      }));
    }
  }, [isPushSupported]);

  const handleSettingChange = async (type) => {
    if (type === 'push') {
      if (settings.push) {
        // Disable push notifications
        setSettings(prev => ({ ...prev, push: false }));
      } else {
        // Request permission for push notifications
        try {
          setIsLoading(true);
          await notificationService.initialize();
          setSettings(prev => ({ ...prev, push: true }));
        } catch (error) {
          console.error('Error enabling push notifications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [type]: !prev[type]
      }));
    }
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    // Here you would typically send these settings to your backend
    alert('Notification preferences saved!');
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 text-slate-100">
      <h3 className="text-xl font-semibold mb-6">Notification Preferences</h3>
      
      <div className="space-y-6">
        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Push Notifications</h4>
            <p className="text-sm text-slate-400">Receive instant alerts on this device</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.push}
              onChange={() => handleSettingChange('push')}
              disabled={!isPushSupported || isLoading}
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            {!isPushSupported && (
              <span className="ml-2 text-xs text-yellow-400">Not supported in this browser</span>
            )}
          </label>
        </div>
        
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-slate-400">Receive alerts via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.email}
              onChange={() => handleSettingChange('email')}
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {settings.email && (
          <div className="ml-8">
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">SMS Alerts</h4>
            <p className="text-sm text-slate-400">Receive text message alerts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.sms}
              onChange={() => handleSettingChange('sms')}
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {settings.sms && (
          <div className="ml-8">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">In-App Notifications</h4>
            <p className="text-sm text-slate-400">Show notifications within the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.inApp}
              onChange={() => handleSettingChange('inApp')}
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
