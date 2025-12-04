// src/components/maps/NearbyAlerts.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { calculateDistance } from '../../utils/geolocation';
import { X, AlertCircle, MapPin, AlertTriangle } from 'lucide-react';

const NEARBY_RADIUS_KM = 100; // Show alerts within 100km

const NearbyAlerts = ({ disasters, userLocation, onClose, locationError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyDisasters, setNearbyDisasters] = useState([]);

  useEffect(() => {
    const findNearbyDisasters = () => {
      try {
        setLoading(true);
        
        if (!userLocation) {
          throw new Error(locationError || 'Location not available. Please enable location services.');
        }

        const nearby = disasters.filter(disaster => {
          if (!disaster.lat || !disaster.lon) return false;
          
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            disaster.lat,
            disaster.lon
          );
          
          return distance <= NEARBY_RADIUS_KM;
        });

        setNearbyDisasters(nearby);
        setError(null);
      } catch (err) {
        console.error('Error finding nearby disasters:', err);
        setError('Could not load nearby alerts. ' + 
          (err.message || 'Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    findNearbyDisasters();
  }, [disasters, userLocation, locationError]);

  const getAlertColor = (level) => {
    const l = (level || "").toLowerCase();
    if (l === "red") return "bg-red-500/10 border-red-500/30 text-red-400";
    if (l === "orange") return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  };

  const getAlertIcon = (level) => {
    const l = (level || "").toLowerCase();
    if (l === "red") return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (l === "orange") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <AlertCircle className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Nearby Alerts
              {userLocation?.accuracy && (
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Accuracy: {Math.round(userLocation.accuracy)}m)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing alerts within {NEARBY_RADIUS_KM}km of your location
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 bg-gradient-to-b from-slate-900 to-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-3"></div>
              <p className="text-sm text-slate-400">Finding nearby alerts...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
              <p className="text-amber-400 font-medium mb-2">Unable to load alerts</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : nearbyDisasters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
              <MapPin className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400">No alerts found within {NEARBY_RADIUS_KM}km</p>
              <p className="text-slate-600 text-sm mt-1">We'll notify you if any new alerts appear</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {nearbyDisasters.map((disaster) => {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  disaster.lat,
                  disaster.lon
                );

                return (
                  <motion.li
                    key={disaster.id || `${disaster.lat}-${disaster.lon}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getAlertIcon(disaster.alertlevel)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-slate-100 truncate">
                            {disaster.name || 'Unnamed Alert'}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getAlertColor(disaster.alertlevel)}`}>
                            {disaster.alertlevel?.toUpperCase() || 'ALERT'}
                          </span>
                        </div>
                        {disaster.description && (
                          <p className="text-sm text-slate-400 mt-1">
                            {disaster.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          <span>{distance.toFixed(1)} km away</span>
                          {disaster.time && (
                            <span className="ml-3">
                              {new Date(disaster.time).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NearbyAlerts;