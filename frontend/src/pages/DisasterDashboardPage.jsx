import React, { useState, useEffect } from 'react';
import { fetchGDACSEvents, fetchEarthquakes } from '../utils/disasterApi';
import { getCurrentPosition } from '../utils/geolocation';
import { FiAlertTriangle, FiTrendingUp, FiMap, FiChevronDown, FiChevronUp, FiClock, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DisasterDashboardPage = () => {
  const [disasters, setDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Get user location
        const position = await getCurrentPosition();
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userCoords);

        // Fetch data from both sources in parallel
        const [gdacsEvents, usgsEarthquakes] = await Promise.all([
          fetchGDACSEvents(),
          fetchEarthquakes()
        ]);
        
        // Process GDACS events
        const processedGdacsEvents = gdacsEvents.map(disaster => ({
          ...disaster,
          source: 'gdacs',
          lng: disaster.lon,
          date: disaster.fromdate,
          magnitude: disaster.severity,
          alertLevel: disaster.alertlevel,
          distance: calculateDistance(
            userCoords.lat,
            userCoords.lng,
            disaster.lat,
            disaster.lon
          )
        }));

        // Process USGS earthquakes
        const processedUsgsEvents = usgsEarthquakes.map(quake => {
          const props = quake.properties;
          const coords = quake.geometry.coordinates;
          const magnitude = props.mag;
          const eventDate = new Date(props.time);
          
          // Map USGS magnitude to alert level
          let alertLevel = 'green';
          if (magnitude >= 6) alertLevel = 'red';
          else if (magnitude >= 4.5) alertLevel = 'orange';
          
          return {
            id: `usgs-${quake.id}`,
            source: 'usgs',
            type: 'earthquake',
            name: `${props.place} (${magnitude.toFixed(1)})`,
            description: props.title,
            country: props.place?.split(', ').pop() || 'Unknown',
            region: props.place || 'Unknown',
            date: eventDate.toISOString(),
            magnitude: magnitude,
            alertLevel: alertLevel,
            lat: coords[1],
            lng: coords[0],
            url: props.url,
            distance: calculateDistance(
              userCoords.lat,
              userCoords.lng,
              coords[1],
              coords[0]
            )
          };
        });

        // Combine and sort all disasters by date (newest first)
        const allDisasters = [...processedGdacsEvents, ...processedUsgsEvents]
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setDisasters(allDisasters);
      } catch (error) {
        console.error('Error loading disaster data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return Math.round(R * c); // Distance in km
  };

  const getSeverityColor = (disaster) => {
  if (disaster.alertLevel === 'red' || disaster.magnitude >= 6) return 'red';
  if (disaster.alertLevel === 'orange' || disaster.magnitude >= 4.5) return 'yellow';
  return 'green';
};

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Filter disasters from the last 30 days for analytics
  const recentDisasters = disasters.filter(disaster => {
    const disasterDate = new Date(disaster.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return disasterDate > thirtyDaysAgo;
  });

  // Calculate top affected regions from disaster data
  const calculateTopRegions = (disasters) => {
    const regionCounts = {};
    
    disasters.forEach(disaster => {
      // Try to get the most specific location information available
      const region = disaster.country || 
                    disaster.region || 
                    (disaster.episodeAlert ? disaster.episodeAlert.region : 'Unknown');
      
      if (region) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });
    
    // Convert to array, sort by count (descending), and take top 5
    return Object.entries(regionCounts)
      .map(([name, count]) => ({
        name: name || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Calculate trend data from GDACS
  const calculateTrends = (disasters) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter disasters for current and previous month
    const currentMonthDisasters = disasters.filter(disaster => {
      const date = new Date(disaster.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const prevMonthDisasters = disasters.filter(disaster => {
      const date = new Date(disaster.date);
      return date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear;
    });
    
    // Calculate percentage change
    const prevMonthCount = prevMonthDisasters.length || 1; // Avoid division by zero
    const increase = Math.round(((currentMonthDisasters.length - prevMonthCount) / prevMonthCount) * 100);
    
    // Get top regions from all recent disasters
    const topRegions = calculateTopRegions(disasters);
    
    return {
      currentMonth: currentMonthDisasters.length,
      lastMonth: prevMonthDisasters.length,
      increase: isFinite(increase) ? increase : 0,
      topRegions: topRegions.length > 0 ? topRegions : [{ name: 'No data', count: 0 }]
    };
  };

  // Calculate trend data with real GDACS data
  const trendData = calculateTrends(recentDisasters);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading disaster data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Current Alerts Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" />
            Current Alerts Near You
          </h2>
          
          <div className="grid gap-4">
            {disasters.slice(0, 5).map((disaster, index) => {
              const severity = getSeverityColor(disaster);
              return (
                <motion.div
                  key={disaster.id}
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
                          {disaster.type === 'earthquake' 
                            ? `Earthquake (${disaster.magnitude?.toFixed?.(1) || 'N/A'})` 
                            : disaster.name || disaster.eventName || 'Disaster Event'}
                        </h3>
                        {disaster.magnitude !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-300">
                            {typeof disaster.magnitude === 'number' 
                              ? disaster.magnitude.toFixed(1) 
                              : disaster.magnitude} 
                            {disaster.type === 'earthquake' ? ' Magnitude' : ' Severity'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5" />
                          {Math.round(disaster.distance)} km away
                          {disaster.source === 'usgs' && ' (USGS)'}
                          {disaster.source === 'gdacs' && ' (GDACS)'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {formatTimeAgo(disaster.date)}
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
                              <p className="text-slate-200">
                                {disaster.place || disaster.country || disaster.region || `${disaster.lat?.toFixed(4)}, ${disaster.lng?.toFixed(4)}`}
                              </p>
                            </div>
                            {disaster.depth && (
                              <div>
                                <h4 className="text-slate-400 mb-1">Depth</h4>
                                <p className="text-slate-200">{disaster.depth} km</p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-slate-400 mb-1">Reported</h4>
                              <p className="text-slate-200">
                                {new Date(disaster.date).toLocaleString()}
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
                          {disaster.url && (
                            <div className="mt-3">
                              <a 
                                href={disaster.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm"
                              >
                                View details on {disaster.source || 'source'} →
                              </a>
                            </div>
                          )}
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
                <span className={`text-sm ${
                  trendData.increase >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {trendData.increase >= 0 ? '+' : ''}{trendData.increase}% from last month
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
                    <span className="text-slate-300">
                      {region.name}
                      {region.name === 'No data' && (
                        <span className="text-xs text-slate-500 ml-1">(no data)</span>
                      )}
                    </span>
                    <span className="text-slate-100 font-medium">
                      {region.count} {region.count === 1 ? 'alert' : 'alerts'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Distribution Section - Commented out as requested */}
            {/* <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-slate-400 text-sm font-medium mb-3">
                Alert Distribution (7 days)
              </h3>
              {recentDisasters.length > 0 ? (
                <div className="h-32 flex items-end gap-1">
                  {Array(7).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setHours(0, 0, 0, 0);
                    date.setDate(date.getDate() - (6 - i));
                    
                    const dayDisasters = recentDisasters.filter(disaster => {
                      const disasterDate = new Date(disaster.date);
                      disasterDate.setHours(0, 0, 0, 0);
                      return disasterDate.getTime() === date.getTime();
                    });
                    
                    const dayCount = dayDisasters.length;
                    
                    const maxCount = Math.max(1, ...Array(7).fill(0).map((_, j) => {
                      const day = new Date();
                      day.setHours(0, 0, 0, 0);
                      day.setDate(day.getDate() - (6 - j));
                      return recentDisasters.filter(d => {
                        const dDate = new Date(d.date);
                        dDate.setHours(0, 0, 0, 0);
                        return dDate.getTime() === day.getTime();
                      }).length;
                    }));
                    
                    const height = dayCount > 0 ? (dayCount / maxCount) * 100 : 5;
                    const hasAlerts = dayCount > 0;
                    
                    const severity = dayDisasters.reduce((maxSev, disaster) => {
                      const sev = disaster.alertlevel || 'green';
                      const sevOrder = { 'red': 3, 'orange': 2, 'green': 1 };
                      return sevOrder[sev] > (sevOrder[maxSev] || 0) ? sev : maxSev;
                    }, '');
                    
                    const getSeverityColor = (sev) => {
                      switch(sev) {
                        case 'red': return 'bg-red-500';
                        case 'orange': return 'bg-orange-500';
                        case 'green': return 'bg-green-500';
                        default: return 'bg-slate-600';
                      }
                    };
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            hasAlerts 
                              ? getSeverityColor(severity)
                              : 'bg-slate-700/50'
                          }`}
                          style={{ 
                            height: `${height}%`,
                            minHeight: hasAlerts ? '10px' : '5px'
                          }}
                          title={`${dayCount} alert${dayCount !== 1 ? 's' : ''} on ${date.toLocaleDateString()}\n${hasAlerts ? `Highest severity: ${severity || 'unknown'}` : 'No alerts'}`}
                        />
                        <span className="text-xs text-slate-500 mt-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500">
                  No alert data available for the last 7 days
                </div>
              )}
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>7 days ago</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                    High
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                    Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Low
                  </span>
                </div>
                <span>Today</span>
              </div>
            </div> */}
          </div>
        </section>

        {/* Timeline View Section - Commented out as requested */}
        {/* <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FiClock className="text-blue-500" />
              Disaster Timeline
            </h2>
            <div className="flex bg-slate-800/50 rounded-lg p-1 text-sm">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeRange === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeRange === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            {recentDisasters.length > 0 ? (
              <>
                <div className="h-40 flex items-end gap-1">
                  {Array(timeRange === 'week' ? 7 : 30).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setHours(0, 0, 0, 0);
                    date.setDate(date.getDate() - ((timeRange === 'week' ? 6 : 29) - i));
                    
                    const dayDisasters = recentDisasters.filter(disaster => {
                      const disasterDate = new Date(disaster.date);
                      disasterDate.setHours(0, 0, 0, 0);
                      return disasterDate.getTime() === date.getTime();
                    });
                    
                    const count = dayDisasters.length;
                    
                    const maxCount = Math.max(1, ...Array(timeRange === 'week' ? 7 : 30).fill(0).map((_, j) => {
                      const day = new Date();
                      day.setHours(0, 0, 0, 0);
                      day.setDate(day.getDate() - ((timeRange === 'week' ? 6 : 29) - j));
                      return recentDisasters.filter(d => {
                        const dDate = new Date(d.date);
                        dDate.setHours(0, 0, 0, 0);
                        return dDate.getTime() === day.getTime();
                      }).length;
                    }));
                    
                    const height = count > 0 ? Math.max(10, (count / maxCount) * 100) : 5;
                    const hasAlerts = count > 0;
                    
                    const severity = dayDisasters.reduce((maxSev, disaster) => {
                      const sev = disaster.alertlevel || getSeverityColor(disaster);
                      const sevOrder = { 'red': 3, 'orange': 2, 'yellow': 2, 'green': 1 };
                      return sevOrder[sev] > (sevOrder[maxSev] || 0) ? sev : maxSev;
                    }, '');
                    
                    const getSeverityClass = (sev) => {
                      switch(sev) {
                        case 'red': return 'bg-red-500';
                        case 'orange':
                        case 'yellow': return 'bg-yellow-500';
                        case 'green': return 'bg-green-500';
                        default: return 'bg-slate-600';
                      }
                    };
                    
                    const tooltipContent = hasAlerts 
                      ? `${count} alert${count !== 1 ? 's' : ''} on ${date.toLocaleDateString()}\n` +
                        `Highest severity: ${severity || 'unknown'}\n` +
                        dayDisasters.map(d => `• ${d.eventName || 'Event'} (${d.alertlevel || 'N/A'})`).join('\n')
                      : 'No alerts';
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-200 ${
                            hasAlerts ? getSeverityClass(severity) : 'bg-slate-700/50'
                          }`}
                          style={{ 
                            height: `${height}%`,
                            minHeight: hasAlerts ? '10px' : '5px',
                            opacity: hasAlerts ? 0.9 : 0.6
                          }}
                          title={tooltipContent}
                        />
                        <span className="text-xs text-slate-500 mt-1">
                          {timeRange === 'week' 
                            ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
                            : (i % (timeRange === 'month' ? 5 : 1) === 0) ? date.getDate() : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-slate-400">
                  <span>{timeRange === 'week' ? '7 days' : '30 days'} ago</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                      High
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                      Medium
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Low
                    </span>
                  </div>
                  <span>Today</span>
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                No disaster data available for the selected time range
              </div>
            )}
          </div>
        </section> */}
      </div>
    </div>
  );
};

export default DisasterDashboardPage;