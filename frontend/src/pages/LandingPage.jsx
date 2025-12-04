import React, { useEffect, useMemo, useState } from "react";
import { fetchEarthquakes, fetchGDACSEvents, fetchCyclones } from "../utils/disasterApi";
import NearbyAlerts from '../components/maps/NearbyAlerts';
// Change this line in LandingPage.jsx
import { getCurrentPosition } from '../utils/geolocation';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import WorldMap from "../components/maps/WorldMap";

import { motion, useMotionValue, useSpring } from "framer-motion";

import {
  FiAlertTriangle,
  FiPhoneCall,
  FiShield,
  FiMapPin,
  FiActivity,
} from "react-icons/fi";

const USGS_EARTHQUAKE_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const NASA_FIRMS_URL =
  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6/csv/MODIS_C6_Global_24h.csv";
const GDACS_EVENTS_URL =
  "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?alertlevel=Green,Orange,Red";
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const formatTimestamp = (ts) => {
  if (!ts) return "Unknown time";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toUTCString();
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 20,
    stiffness: 100
  });

  useEffect(() => {
    motionValue.set(value || 0);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplayValue(Math.round(v));
    });
    return () => unsubscribe();
  }, [spring]);

  return <motion.span>{displayValue.toLocaleString()}</motion.span>;
};


// Add this useEffect to get the user's location


const getAlertColor = (level) => {
  const l = (level || "").toLowerCase();
  if (l === "red") return "#ef4444";
  if (l === "orange") return "#f97316";
  if (l === "green") return "#22c55e";
  return "#3b82f6";
};

const LandingPage = () => {
  const [showNearbyAlerts, setShowNearbyAlerts] = useState(false);
  const [allDisasters, setAllDisasters] = useState([]);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
const [locationError, setLocationError] = useState(null);       // Add this line if not already present
  const [disasterData, setDisasterData] = useState({
    earthquakes: [],
    gdacsEvents: [],
    cyclones: [],
    loading: true,
    errorGdacs: null
  });
useEffect(() => {
  const getUserLocation = async () => {
    try {
      const position = await getCurrentPosition();
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to access your location. Please enable location services and refresh the page.');
    }
  };

  getUserLocation();
}, []);
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setDisasterData(prev => ({ ...prev, loading: true }));
        const [earthquakes, gdacsEvents, cyclones] = await Promise.all([
          fetchEarthquakes(),
          fetchGDACSEvents(),
          fetchCyclones()
        ]);

        // Combine all disasters into one array for NearbyAlerts
        const combinedDisasters = [
          ...(earthquakes?.features?.map(e => ({
            ...e,
            type: 'earthquake',
            lat: e.geometry?.coordinates[1],
            lon: e.geometry?.coordinates[0],
            name: e.properties?.title || 'Earthquake',
            description: `Magnitude: ${e.properties?.mag || 'N/A'}`
          })) || []),
          ...(gdacsEvents?.map(event => ({
            ...event,
            type: event.type || 'disaster',
            lat: event.lat || event.geometry?.coordinates?.[1],
            lon: event.lon || event.geometry?.coordinates?.[0],
            name: event.name || 'GDACS Event',
            description: event.description || 'No description available'
          })) || []),
          ...((cyclones?.features || cyclones)?.map(cyclone => {
            const props = cyclone.properties || cyclone;
            return {
              ...cyclone,
              type: 'cyclone',
              lat: cyclone.lat || cyclone.geometry?.coordinates?.[1] || props.lat,
              lon: cyclone.lon || cyclone.geometry?.coordinates?.[0] || props.lon,
              name: props.name || 'Cyclone',
              description: `Category: ${props.category || 'N/A'}`
            };
          }) || [])
        ];

        setAllDisasters(combinedDisasters);

        // Update disaster data
        setDisasterData({
          earthquakes,
          gdacsEvents,
          cyclones,
          loading: false,
          errorGdacs: null
        });

      } catch (error) {
        console.error('Error loading data:', error);
        setDisasterData(prev => ({
          ...prev,
          loading: false,
          errorGdacs: 'Failed to load disaster data'
        }));
        setError('Failed to load disaster data');
      }
    };

    loadAllData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    totalDisasters,
    uniqueRegions,
    highSeverityCount,
    loadingAny,
    tickerItems,
  } = useMemo(() => {
    const loadingAnyInner = disasterData.loading;

    const totalDisastersInner =
      (disasterData.earthquakes?.length || 0) +
      (disasterData.gdacsEvents?.length || 0);

    const regions = new Set();

    // Process earthquakes
    disasterData.earthquakes.forEach((q) => {
      if (q.properties?.place) regions.add(q.properties.place);
      else if (q.geometry?.coordinates) {
        regions.add(`${q.geometry.coordinates[1].toFixed(2)},${q.geometry.coordinates[0].toFixed(2)}`);
      }
    });

    // Process GDACS events
    if (disasterData.gdacsEvents && Array.isArray(disasterData.gdacsEvents)) {
      disasterData.gdacsEvents.forEach((event) => {
        if (event.country && event.country !== "null") {
          regions.add(event.country);
        } else if (event.title) {
          regions.add(event.title);
        } else if (event.from) { // Some GDACS events use 'from' for location
          regions.add(event.from);
        }
      });
    }

    let high = 0;
    // Count high magnitude earthquakes (>= 6.0)
    disasterData.earthquakes.forEach((q) => {
      const mag = q.properties?.mag;
      if (typeof mag === "number" && mag >= 6) high += 1;
    });

    // Count high severity GDACS events (alert level red or orange)
    if (disasterData.gdacsEvents && Array.isArray(disasterData.gdacsEvents)) {
      disasterData.gdacsEvents.forEach((e) => {
        const level = (e.alertlevel || e.alertLevel || "").toLowerCase();
        if (level === "red" || level === "orange") high += 1;
      });
    }

    const tickerInner = [];

    // Add earthquake alerts to ticker
    disasterData.earthquakes
      .filter(q => q.properties?.mag >= 5.0) // Only show significant quakes in ticker
      .slice(0, 5) // Limit number of quakes in ticker
      .forEach((q) => {
        const mag = q.properties?.mag?.toFixed(1) || 'Unknown';
        const place = q.properties?.place || 'Unknown location';
        tickerInner.push(`🌍 M${mag} Earthquake - ${place}`);
      });

    // Add GDACS alerts to ticker
    if (disasterData.gdacsEvents && Array.isArray(disasterData.gdacsEvents)) {
      disasterData.gdacsEvents.slice(0, 5).forEach((e) => {
        const level = (e.alertlevel || e.alertLevel || 'UNKNOWN').toUpperCase();
        const type = (e.eventtype || e.type || 'Alert').toString();
        const location = e.country || e.from || 'Unknown region';
        const sev = e.severity ?
          (e.severityUnit ? `${e.severity} ${e.severityUnit}` : `${e.severity}`) :
          '';

        let base = `⚠️ ${level} ${type}`;
        if (sev) base += ` (${sev})`;
        base += ` - ${location}`;
        tickerInner.push(base);
      });
    }

    return {
      totalDisasters: totalDisastersInner,
      uniqueRegions: regions.size,
      highSeverityCount: high,
      loadingAny: loadingAnyInner,
      tickerItems: tickerInner,
    };
  }, [disasterData]);

  const handleCtaClick = (label) => {
    console.log(`CTA clicked: ${label}`);
  };

  const { loading, errorGdacs, earthquakes = [], gdacsEvents = [], cyclones = [] } = disasterData;
  const isMapLoading = loading;
  const errorQuakes = null;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-medium">
            <FiActivity className="w-4 h-4" />
            <span>Live Global Disaster Alerts</span>
          </div>
          <div className="relative flex-1 overflow-hidden">
            {tickerItems.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                {errorGdacs
                  ? "Unable to load GDACS alerts"
                  : "Fetching latest multi-disaster alerts from GDACS..."}
              </p>
            ) : (
              <motion.div
                className="flex gap-12 whitespace-nowrap text-xs sm:text-sm"
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
              >
                {tickerItems.concat(tickerItems).map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="text-slate-200 flex items-center gap-1"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <section className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="xl:col-span-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl h-[360px] sm:h-[420px] md:h-[480px] mb-6">
                <WorldMap
                  earthquakes={earthquakes}
                  gdacsEvents={gdacsEvents}
                  cyclones={cyclones}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mb-8">
                <button
                  onClick={() => setShowNearbyAlerts(true)}
                  disabled={!userLocation && !locationError}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl ${
                    userLocation 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' 
                      : 'bg-gray-500 cursor-not-allowed text-slate-200'
                  } font-medium px-4 py-2.5 text-sm shadow-lg transition`}
                >
                  <FiMapPin className="w-4 h-4" />
                  <span>
                    {userLocation 
                      ? 'View Nearby Alerts'
                      : locationError 
                        ? 'Location Unavailable'
                        : 'Getting Location...'}
                  </span>
                </button>
                <button
                  onClick={() => handleCtaClick("Emergency Contacts")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-4 py-2.5 text-sm border border-slate-700/80 transition"
                >
                  <FiPhoneCall className="w-4 h-4" />
                  <span>Emergency Contacts</span>
                </button>
               
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>Earthquakes (USGS)</span>
                {errorQuakes && (
                  <span className="text-red-400 ml-1">• {errorQuakes}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Multi-disaster alerts (GDACS)</span>
                {errorGdacs && (
                  <span className="text-red-400 ml-1">• {errorGdacs}</span>
                )}
              </div>
            </div>
        </div>

        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-emerald-400" />
              Global Situation Snapshot
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400">Active disasters (24h)</p>
                  <AnimatedNumber value={totalDisasters} />
                </div>
                <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-col gap-1">
                  <span className="text-slate-400">Affected regions</span>
                  <AnimatedNumber value={uniqueRegions} />
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-col gap-1">
                  <span className="text-slate-400">High-severity events</span>
                  <AnimatedNumber value={highSeverityCount} />
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              {loadingAny ? (
                <span>Continuously syncing with live feeds...</span>
              ) : (
                <span>Data refreshed from USGS, NASA FIRMS &amp; GDACS within the last 24 hours.</span>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Operational notes
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Earthquake data is sourced directly from the USGS GeoJSON feed for the last 24 hours.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-yellow-300" />
                <span>Active fire locations are ingested from NASA MODIS C6 global 24-hour CSV.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Multi-disaster risks (cyclones, floods, volcanoes) are integrated via GDACS JSON API.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
      </main >

  <footer className="border-t border-slate-900 bg-slate-950/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
      <span>
        This dashboard consumes live public APIs and is intended for
        situational awareness and research use.
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live data connected</span>
      </span>
    </div>
  </footer>
{/* Add this at the bottom, just before the final closing </div> */ }
{
  showNearbyAlerts && (
    <NearbyAlerts
      disasters={allDisasters}
      userLocation={userLocation}
      locationError={locationError}
      onClose={() => setShowNearbyAlerts(false)}
    />
  )
}
    </div >
  );
};

export default LandingPage;