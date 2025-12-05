import React from 'react'
import Header from './Home/Header'
import Map from './map'
import {
  useEffect, useMemo, useState
} from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaExclamationTriangle,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaLifeRing,
} from 'react-icons/fa'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const makeIcon = (colorUrl) =>
  new L.Icon({
    iconUrl: colorUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  })

const icons = {
  earthquake: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
  ),
  wildfire: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'
  ),
  cyclone: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png'
  ),
  flood: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
  ),
  volcano: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png'
  ),
  other: makeIcon(
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
  ),
}

const USGS_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
const NASA_FIRMS_URL =
  'https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6/csv/MODIS_C6_Global_24h.csv'
const GDACS_URL =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?alertlevel=Green,Orange,Red'

const Home = () => {
  const [earthquakes, setEarthquakes] = useState([])
  const [wildfires, setWildfires] = useState([])
  const [gdacsEvents, setGdacsEvents] = useState([])

  const [loadingEq, setLoadingEq] = useState(true)
  const [loadingFires, setLoadingFires] = useState(true)
  const [loadingGdacs, setLoadingGdacs] = useState(true)

  const [errorEq, setErrorEq] = useState(null)
  const [errorFires, setErrorFires] = useState(null)
  const [errorGdacs, setErrorGdacs] = useState(null)

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoadingEq(true)
        setErrorEq(null)
        const res = await fetch(USGS_URL)
        if (!res.ok) throw new Error(`USGS error ${res.status}`)
        const data = await res.json()
        const eqs =
          data?.features?.map((f) => {
            const [lon, lat, depth] = f.geometry.coordinates || []
            const p = f.properties || {}
            return {
              id: f.id,
              type: 'earthquake',
              lat,
              lon,
              depth,
              magnitude: p.mag,
              location: p.place,
              time: p.time,
              url: p.url,
            }
          }) || []
        setEarthquakes(eqs.filter((e) => e.lat && e.lon))
      } catch (err) {
        console.error('Error fetching earthquakes', err)
        setErrorEq(err.message || 'Unable to load earthquake data')
      } finally {
        setLoadingEq(false)
      }
    }
    fetchEarthquakes()
  }, [])

  useEffect(() => {
    const fetchFires = async () => {
      try {
        setLoadingFires(true)
        setErrorFires(null)
        const res = await fetch(NASA_FIRMS_URL)
        if (!res.ok) throw new Error(`FIRMS error ${res.status}`)
        const text = await res.text()

        const lines = text.trim().split('\n')
        const header = lines[0].split(',')
        const getIndex = (name) => header.indexOf(name)

        const latIdx = getIndex('latitude')
        const lonIdx = getIndex('longitude')
        const brightIdx = getIndex('brightness')
        const confIdx = getIndex('confidence')
        const dateIdx = getIndex('acq_date')
        const timeIdx = getIndex('acq_time')

        const fires = lines.slice(1).map((line, idx) => {
          const cols = line.split(',')
          const lat = parseFloat(cols[latIdx])
          const lon = parseFloat(cols[lonIdx])
          const brightness = parseFloat(cols[brightIdx])
          const confidence = cols[confIdx]
          const date = cols[dateIdx]
          const time = cols[timeIdx]

          return {
            id: `fire-${idx}`,
            type: 'wildfire',
            lat,
            lon,
            brightness,
            confidence,
            time: date && time ? `${date} ${time} UTC` : date,
            location: `Lat ${lat?.toFixed(2)}, Lon ${lon?.toFixed(2)}`,
          }
        })

        setWildfires(
          fires.filter(
            (f) =>
              Number.isFinite(f.lat) &&
              Number.isFinite(f.lon) &&
              !Number.isNaN(f.lat) &&
              !Number.isNaN(f.lon)
          )
        )
      } catch (err) {
        console.error('Error fetching wildfires', err)
        setErrorFires(err.message || 'Unable to load wildfire data')
      } finally {
        setLoadingFires(false)
      }
    }
    fetchFires()
  }, [])

  useEffect(() => {
    const fetchGdacs = async () => {
      try {
        setLoadingGdacs(true)
        setErrorGdacs(null)
        const res = await fetch(GDACS_URL)
        if (!res.ok) throw new Error(`GDACS error ${res.status}`)
        const data = await res.json()

        const rawEvents = Array.isArray(data)
          ? data
          : Array.isArray(data?.features)
          ? data.features
          : data?.events || []

        const normalize = (e, idx) => {
          const props = e.properties || e
          const geom = e.geometry || {}

          let lat = props?.lat ?? props?.latitude
          let lon = props?.lon ?? props?.longitude
          if (!lat && geom?.coordinates?.length >= 2) {
            lon = geom.coordinates[0]
            lat = geom.coordinates[1]
          }

          const eventType =
            (props?.eventtype || props?.type || '').toLowerCase()
          let type = 'other'
          if (eventType.includes('cyclone') || eventType.includes('tc'))
            type = 'cyclone'
          else if (eventType.includes('flood')) type = 'flood'
          else if (eventType.includes('volcano')) type = 'volcano'

          const alertLevel =
            (props?.alertlevel || props?.severity || '').toString()
          const country = props?.country || props?.countryname
          const name =
            props?.eventname || props?.title || props?.name || 'GDACS Event'

          const from = props?.fromdate || props?.begindate || props?.date
          const to = props?.todate || props?.enddate
          const timeText = to ? `${from} – ${to}` : from

          return {
            id: props?.eventid || props?.id || `gdacs-${idx}`,
            type,
            rawType: eventType,
            name,
            lat: lat ? parseFloat(lat) : undefined,
            lon: lon ? parseFloat(lon) : undefined,
            alertLevel,
            country,
            time: timeText,
            description:
              props?.description ||
              props?.headline ||
              props?.impacttext ||
              '',
          }
        }

        const events = (rawEvents || [])
          .map(normalize)
          .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lon))

        setGdacsEvents(events)
      } catch (err) {
        console.error('Error fetching GDACS events', err)
        setErrorGdacs(err.message || 'Unable to load GDACS alerts')
      } finally {
        setLoadingGdacs(false)
      }
    }

    fetchGdacs()
  }, [])

  const allDisasters = useMemo(
    () => [...earthquakes, ...wildfires, ...gdacsEvents],
    [earthquakes, wildfires, gdacsEvents]
  )

  const stats = useMemo(() => {
    const total = allDisasters.length

    const uniqueLocations = new Set()
    allDisasters.forEach((d) => {
      const key =
        d.location ||
        `${Math.round(d.lat * 10) / 10},${Math.round(d.lon * 10) / 10}`
      if (key) uniqueLocations.add(key)
    })

    const highSeverityCount = allDisasters.reduce((acc, d) => {
      let high = false

      if (d.type === 'earthquake') {
        if (d.magnitude >= 5.5) high = true
      } else if (d.type === 'wildfire') {
        if (d.brightness >= 350 || String(d.confidence).toLowerCase().includes('high'))
          high = true
      } else {
        const level = String(d.alertLevel || '').toLowerCase()
        if (level.includes('red')) high = true
      }

      return acc + (high ? 1 : 0)
    }, 0)

    return {
      totalDisasters: total,
      affectedRegions: uniqueLocations.size,
      highSeverityEvents: highSeverityCount,
    }
  }, [allDisasters])

  const tickerItems = useMemo(() => {
    const gdacsItems = gdacsEvents.map((e) => {
      const level = e.alertLevel || ''
      const label =
        level.toLowerCase() === 'red'
          ? 'Red Alert'
          : level.toLowerCase() === 'orange'
          ? 'Orange Alert'
          : 'Green Alert'

      const typeLabel =
        e.type && e.type !== 'other'
          ? e.type.charAt(0).toUpperCase() + e.type.slice(1)
          : 'Event'

      return `${label} – ${typeLabel} ${e.name || ''}${
        e.country ? ` – ${e.country}` : ''
      }`
    })

    const eqItems = earthquakes
      .filter((e) => e.magnitude >= 4.5)
      .slice(0, 10)
      .map(
        (e) =>
          `M${e.magnitude.toFixed(1)} Earthquake detected near ${
            e.location || 'Unknown location'
          }`
      )

    return [...gdacsItems, ...eqItems]
  }, [gdacsEvents, earthquakes])

  const anyLoading = loadingEq || loadingFires || loadingGdacs

  const handleCTA = (label) => {
    console.log(`CTA clicked: ${label}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">
            <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Live Global Alerts</span>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {tickerItems.length === 0 && !anyLoading && !errorGdacs && (
              <span className="text-xs sm:text-sm text-slate-400">
                No active GDACS alerts at the moment.
              </span>
            )}

            {anyLoading && (
              <span className="text-xs sm:text-sm text-slate-400">
                Loading latest global alerts…
              </span>
            )}

            {!anyLoading && tickerItems.length > 0 && (
              <motion.div
                className="whitespace-nowrap flex gap-8 text-xs sm:text-sm text-slate-100"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 40,
                  ease: 'linear',
                }}
              >
                {[...Array(2)].map((_, loopIndex) => (
                  <div
                    key={loopIndex}
                    className="flex gap-8 items-center pr-8"
                  >
                    {tickerItems.map((item, idx) => (
                      <div
                        key={`${loopIndex}-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="truncate max-w-xs sm:max-w-md">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-50"
              >
                Global Disaster Management & Early Warning Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="text-sm sm:text-base text-slate-400 max-w-xl"
              >
                Live monitoring of earthquakes, wildfires, cyclones, floods,
                and other hazards from trusted international data sources.
                Powered by USGS, NASA FIRMS, and GDACS.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => handleCTA('View Nearby Alerts')}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-semibold px-4 sm:px-5 py-2 shadow-lg shadow-emerald-500/25 transition"
                >
                  <FaMapMarkedAlt className="w-4 h-4" />
                  <span>View Nearby Alerts</span>
                </button>
                <button
                  onClick={() => handleCTA('Emergency Contacts')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/60 hover:bg-slate-800 text-sm font-semibold px-4 sm:px-5 py-2 transition"
                >
                  <FaPhoneAlt className="w-4 h-4 text-amber-400" />
                  <span>Emergency Contacts</span>
                </button>
                <button
                  onClick={() => handleCTA('Safety Resources')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/60 hover:bg-slate-800 text-sm font-semibold px-4 sm:px-5 py-2 transition"
                >
                  <FaLifeRing className="w-4 h-4 text-sky-400" />
                  <span>Safety Resources</span>
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full lg:w-80 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Snapshot – Last 24 Hours
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Earthquakes</span>
                  <span className="text-slate-100 font-semibold">
                    {earthquakes.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Wildfires</span>
                  <span className="text-slate-100 font-semibold">
                    {wildfires.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GDACS Alerts</span>
                  <span className="text-slate-100 font-semibold">
                    {gdacsEvents.length}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
                Data sources automatically refresh based on public feeds.
                Always follow guidance from local authorities for actionable
                decisions.
              </p>
            </motion.div>
          </header>

          <section className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/60"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
                <div className="space-y-0.5">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-50">
                    Live Global Disaster Map
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Pan, zoom, and inspect active events around the world.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Earthquakes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Wildfires
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    Cyclones
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Floods
                  </span>
                </div>
              </div>
              <div className="h-[420px] sm:h-[480px]">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  minZoom={2}
                  maxZoom={10}
                  worldCopyJump
                  className="w-full h-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LayersControl position="topright">
                    <LayersControl.Overlay
                      checked
                      name={`Earthquakes (${earthquakes.length})`}
                    >
                      <>
                        {earthquakes.map((eq) => (
                          <Marker
                            key={eq.id}
                            position={[eq.lat, eq.lon]}
                            icon={icons.earthquake}
                          >
                            <Popup>
                              <div className="space-y-1 text-xs">
                                <p className="font-semibold text-red-500">
                                  Earthquake
                                </p>
                                {eq.location && (
                                  <p className="text-slate-800">
                                    {eq.location}
                                  </p>
                                )}
                                {eq.magnitude != null && (
                                  <p className="text-slate-700">
                                    Magnitude:{' '}
                                    <span className="font-semibold">
                                      {eq.magnitude.toFixed(1)}
                                    </span>
                                  </p>
                                )}
                                {eq.depth != null && (
                                  <p className="text-slate-700">
                                    Depth:{' '}
                                    <span className="font-semibold">
                                      {eq.depth} km
                                    </span>
                                  </p>
                                )}
                                {eq.time && (
                                  <p className="text-slate-500">
                                    {new Date(eq.time).toUTCString()}
                                  </p>
                                )}
                                {eq.url && (
                                  <a
                                    href={eq.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-sky-600 underline"
                                  >
                                    View detailed USGS report
                                  </a>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked
                      name={`Wildfires (${wildfires.length})`}
                    >
                      <>
                        {wildfires.map((fire) => (
                          <Marker
                            key={fire.id}
                            position={[fire.lat, fire.lon]}
                            icon={icons.wildfire}
                          >
                            <Popup>
                              <div className="space-y-1 text-xs">
                                <p className="font-semibold text-orange-500">
                                  Wildfire (NASA FIRMS)
                                </p>
                                {fire.location && (
                                  <p className="text-slate-800">
                                    {fire.location}
                                  </p>
                                )}
                                {fire.brightness != null && (
                                  <p className="text-slate-700">
                                    Brightness:{' '}
                                    <span className="font-semibold">
                                      {fire.brightness.toFixed(1)}
                                    </span>
                                  </p>
                                )}
                                {fire.confidence && (
                                  <p className="text-slate-700">
                                    Confidence:{' '}
                                    <span className="font-semibold">
                                      {fire.confidence}
                                    </span>
                                  </p>
                                )}
                                {fire.time && (
                                  <p className="text-slate-500">
                                    {fire.time}
                                  </p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                      checked
                      name={`GDACS Alerts (${gdacsEvents.length})`}
                    >
                      <>
                        {gdacsEvents.map((e) => (
                          <Marker
                            key={e.id}
                            position={[e.lat, e.lon]}
                            icon={icons[e.type] || icons.other}
                          >
                            <Popup>
                              <div className="space-y-1 text-xs">
                                <p className="font-semibold text-violet-500">
                                  {e.name || 'GDACS Event'}
                                </p>
                                {e.country && (
                                  <p className="text-slate-800">
                                    {e.country}
                                  </p>
                                )}
                                {e.rawType && (
                                  <p className="text-slate-700">
                                    Type:{' '}
                                    <span className="font-semibold capitalize">
                                      {e.rawType}
                                    </span>
                                  </p>
                                )}
                                {e.alertLevel && (
                                  <p className="text-slate-700">
                                    Alert Level:{' '}
                                    <span className="font-semibold">
                                      {e.alertLevel}
                                    </span>
                                  </p>
                                )}
                                {e.time && (
                                  <p className="text-slate-500">{e.time}</p>
                                )}
                                {e.description && (
                                  <p className="text-slate-600 mt-1">
                                    {e.description}
                                  </p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </>
                    </LayersControl.Overlay>
                  </LayersControl>
                </MapContainer>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="space-y-5"
            >
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Real-Time Statistics
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-950/60 rounded-xl px-3 py-3 border border-slate-800/80"
                  >
                    <p className="text-[11px] text-slate-400 mb-1">
                      Active Events
                    </p>
                    <motion.p
                      key={stats.totalDisasters}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-xl font-semibold text-slate-50"
                    >
                      {stats.totalDisasters.toLocaleString()}
                    </motion.p>
                    <p className="text-[10px] text-slate-500">
                      Combined feed from all sources
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="bg-slate-950/60 rounded-xl px-3 py-3 border border-slate-800/80"
                  >
                    <p className="text-[11px] text-slate-400 mb-1">
                      Affected Regions
                    </p>
                    <motion.p
                      key={stats.affectedRegions}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-xl font-semibold text-slate-50"
                    >
                      {stats.affectedRegions.toLocaleString()}
                    </motion.p>
                    <p className="text-[10px] text-slate-500">
                      Unique approximate locations
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-950/60 rounded-xl px-3 py-3 border border-red-500/60"
                  >
                    <p className="text-[11px] text-red-300 mb-1">
                      High Severity
                    </p>
                    <motion.p
                      key={stats.highSeverityEvents}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-xl font-semibold text-red-400"
                    >
                      {stats.highSeverityEvents.toLocaleString()}
                    </motion.p>
                    <p className="text-[10px] text-red-300/70">
                      Red alerts, strong quakes, intense fires
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/70 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Data Source Status
                </p>
                <div className="space-y-2 text-xs">
                  <StatusRow
                    label="USGS Earthquakes"
                    loading={loadingEq}
                    error={errorEq}
                    count={earthquakes.length}
                  />
                  <StatusRow
                    label="NASA FIRMS Wildfires"
                    loading={loadingFires}
                    error={errorFires}
                    count={wildfires.length}
                  />
                  <StatusRow
                    label="GDACS Multi-Hazard Alerts"
                    loading={loadingGdacs}
                    error={errorGdacs}
                    count={gdacsEvents.length}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  If a data feed is temporarily unavailable, map markers from
                  that source will be hidden but the dashboard remains
                  functional.
                </p>
              </div>
            </motion.aside>
          </section>
        </div>
      </main>
    </div>
  )
}

const StatusRow = ({ label, loading, error, count }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-slate-300">{label}</p>
        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-red-400 mt-0.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2">
        {loading && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Loading
          </span>
        )}
        {!loading && !error && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            OK · {count}
          </span>
        )}
        {!loading && error && (
          <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Failed
          </span>
        )}
      </div>
    </div>
  )
}

export default Home