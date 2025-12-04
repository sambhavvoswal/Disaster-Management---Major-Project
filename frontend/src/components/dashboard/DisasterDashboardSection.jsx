// src/components/dashboard/DisasterDashboardSection.jsx
import React, { useState } from 'react';
import { 
  FiAlertTriangle, 
  FiBarChart2, 
  FiMapPin, 
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiMap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DisasterDashboardSection = ({ disasters, userLocation }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Mock data - replace with real data
  const nearbyAlerts = [
    {
      id: 1,
      type: 'earthquake',
      name: 'Earthquake - Bangalore',
      magnitude: 5.8,
      distance: 40,
      time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      location: '12.9716° N, 77.5946° E',
      depth: '10 km',
      status: 'active'
    },
    // Add more mock alerts as needed
  ];

  const trendData = {
    currentMonth: 24,
    lastMonth: 18,
    increase: 33,
    topRegions: [
      { name: 'Bangalore', count: 8 },
      { name: 'Mumbai', count: 5 },
      { name: 'Delhi', count: 4 }
    ]
  };

  const getSeverityColor = (alert) => {
    if (alert.magnitude >= 6) return 'red';
    if (alert.magnitude >= 4.5) return 'yellow';
    return 'green';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-8">
      {/* Current Alerts Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <FiAlertTriangle className="text-red-500" />
          Current Alerts Near You
        </h2>
        
        <div className="grid gap-4">
          {nearbyAlerts.map((alert, index) => {
            const severity = getSeverityColor(alert);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-xl overflow-hidden ${
                  severity === 'red' ? 'border-red-500/30' :
                  severity === 'yellow' ? 'border-yellow-500/30' : 'border-green-500/30'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedAlert(expandedAlert === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        severity === 'red' ? 'bg-red-500' : 
                        severity === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <h3 className="font-medium text-slate-100">
                        {alert.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-300">
                        {alert.magnitude.toFixed(1)} Magnitude
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3.5 h-3.5" />
                        {alert.distance} km away
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" />
                        {formatTimeAgo(alert.time)}
                      </span>
                      {expandedAlert === index ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedAlert === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-slate-800/50">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="text-slate-400 mb-1">Location</h4>
                            <p className="text-slate-200">{alert.location}</p>
                          </div>
                          <div>
                            <h4 className="text-slate-400 mb-1">Depth</h4>
                            <p className="text-slate-200">{alert.depth}</p>
                          </div>
                          <div>
                            <h4 className="text-slate-400 mb-1">Reported</h4>
                            <p className="text-slate-200">
                              {alert.time.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-slate-400 mb-1">Status</h4>
                            <p className="text-slate-200">
                              {severity === 'red' ? 'High Alert' : 
                               severity === 'yellow' ? 'Moderate Alert' : 'Low Alert'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trend Analytics Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <FiTrendingUp className="text-blue-500" />
          Trend Analytics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-slate-400 text-sm font-medium mb-2">This Month</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">
                {trendData.currentMonth}
              </span>
              <span className="text-sm text-emerald-400">
                +{trendData.increase}% from last month
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-slate-400 text-sm font-medium mb-3">
              Most Affected Regions
            </h3>
            <div className="space-y-3">
              {trendData.topRegions.map((region, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-slate-300">{region.name}</span>
                  <span className="text-slate-100 font-medium">
                    {region.count} alerts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-slate-400 text-sm font-medium mb-3">
              Alert Distribution
            </h3>
            <div className="h-32 flex items-end gap-1">
              {Array(7).fill(0).map((_, i) => {
                const value = Math.floor(Math.random() * 10) + 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-sm"
                      style={{ height: `${(value / 10) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500 mt-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline View Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FiMap className="text-amber-500" />
            Timeline View
          </h2>
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'week' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'month' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="relative h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700" />
          <div className="absolute bottom-0 left-0 right-0 flex justify-between h-full items-end">
            {Array(timeRange === 'week' ? 7 : 30).fill(0).map((_, i) => {
              const count = Math.floor(Math.random() * 5);
              const height = (count / 5) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-sm ${
                      count > 3 ? 'bg-red-500' : 
                      count > 1 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-500 mt-1">
                    {timeRange === 'week' 
                      ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]
                      : i % 5 === 0 ? i + 1 : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DisasterDashboardSection;