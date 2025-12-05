import React from "react";
import { CircleMarker, Popup } from "react-leaflet";
import styled from 'styled-components';

const LegendContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 10px;
  background: rgba(30, 41, 59, 0.85);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1000;
  font-family: Arial, sans-serif;
  font-size: 11px;
  max-width: 140px;
  color: #f8fafc;
  backdrop-filter: blur(4px);
`;

const LegendTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #f8fafc;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 2px 0;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  min-width: 12px;
  min-height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.color};
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const formatTimestamp = (ts) => {
  if (!ts) return "Unknown time";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts.toString());
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toUTCString();
};

const getAlertColor = (level) => {
  const l = (level || "").toLowerCase();
  if (l === "red") return "#ef4444";
  if (l === "orange") return "#f97316";
  if (l === "green") return "#22c55e";
  return "#3b82f6";
};

const getGdacsCategory = (type, title) => {
  const text = `${type || ""} ${title || ""}`.toLowerCase();
  if (text.includes("cyclone") || text.includes("typhoon") || text.includes("hurricane") || text.includes("storm")) {
    return "cyclone";
  }
  if (text.includes("flood") || text.includes("inundation")) {
    return "flood";
  }
  if (text.includes("landslide") || text.includes("mudslide")) {
    return "landslide";
  }
  if (text.includes("heatwave") || text.includes("heat wave") || text.includes("heat")) {
    return "heatwave";
  }
  if (text.includes("earthquake") || text.includes("quake") || text.includes("seismic")) {
    return "earthquake";
  }
  if (text.includes("volcano") || text.includes("eruption")) {
    return "volcano";
  }
  if (text.includes("wildfire") || text.includes("bushfire") || text.includes("forest fire")) {
    return "wildfire";
  }
  if (text.includes("drought") || text.includes("arid")) {
    return "drought";
  }
  return "other";
};

const getGdacsCategoryColor = (category) => {
  const colors = {
    "cyclone": "#38bdf8",     // Blue
    "flood": "#3b82f6",       // Darker Blue
    "landslide": "#a855f7",   // Purple
    "heatwave": "#f97316",    // Orange
    "earthquake": "#ef4444",  // Red
    "volcano": "#f59e0b",     // Amber
    "wildfire": "#f43f5e",    // Rose
    "drought": "#8f5b02ff",     // Yellow
    "other": "#22c55e"        // Green
  };
  return colors[category] || colors.other;
};

const DisasterMarkers = ({ earthquakes = [], wildfires = [], gdacsEvents = [], cyclones = [] }) => {
  const disasterTypes = [
    { name: 'Earthquake', color: '#ef4444' },  // Red
    { name: 'Wildfire', color: '#f43f5e' },    // Amber
    { name: 'Cyclone', color: '#38bdf8' },     // Light Blue
    { name: 'Flood', color: '#3b82f6' },       // Darker Blue
    { name: 'Landslide', color: '#a855f7' },   // Purple
    { name: 'Heatwave', color: '#f97316' },    // Orange
    { name: 'Volcano', color: '#f59e0b' },     // Amber (same as Wildfire)
    { name: 'Drought', color: '#8f5b02ff' },     // Amber (same as Wildfire)
    { name: 'Other', color: '#22c55e' }        // Green
  ];

  return (
    <>
      <LegendContainer>
        <LegendTitle>Disaster Types</LegendTitle>
        {disasterTypes.map((type, index) => (
          <LegendItem key={index}>
            <LegendColor color={type.color} />
            <span>{type.name}</span>
          </LegendItem>
        ))}
      </LegendContainer>

      {/* Earthquake Markers */}
      {earthquakes.map(quake => (
        <CircleMarker
          key={`eq-${quake.id}`}
          center={[quake.geometry.coordinates[1], quake.geometry.coordinates[0]]}
          radius={Math.min(quake.properties.mag * 2, 10)}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.7,
            weight: 1
          }}
        >
          <Popup>
            <div className="space-y-1 text-xs">
              <div className="font-bold">Earthquake</div>
              <div>Magnitude: {quake.properties.mag}</div>
              <div>Location: {quake.properties.place}</div>
              <div>Depth: {quake.geometry.coordinates[2]} km</div>
              <div>Time: {new Date(quake.properties.time).toLocaleString()}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Wildfire Markers */}
      {wildfires.map((fire, index) => (
        <CircleMarker
          key={`fire-${index}`}
          center={[fire.lat, fire.lon]}
          radius={Math.min(fire.frp / 10, 8)}
          pathOptions={{
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.7,
            weight: 1
          }}
        >
          <Popup>
            <div className="space-y-1 text-xs">
              <div className="font-bold">Wildfire</div>
              <div>Brightness: {fire.brightness}°K</div>
              <div>Confidence: {fire.confidence}%</div>
              <div>Date: {fire.date}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Cyclone Markers */}
      {cyclones.map(cyclone => (
        <CircleMarker
          key={`cyclone-${cyclone.id}`}
          center={[cyclone.lat, cyclone.lon]}
          radius={8}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.7,
            weight: 2
          }}
        >
          <Popup>
            <div className="space-y-1 text-xs">
              <div className="font-semibold">Cyclone {cyclone.name || 'Unnamed'}</div>
              <div>Category: {cyclone.category || 'N/A'}</div>
              <div>Wind: {cyclone.windSpeed ? `${cyclone.windSpeed} mph` : 'N/A'}</div>
              <div>Pressure: {cyclone.pressure ? `${cyclone.pressure} mb` : 'N/A'}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* GDACS Event Markers */}
{/* GDACS Event Markers */}
{gdacsEvents
  .filter(event => event.lat && event.lon)
  .map((event) => {
    const category = getGdacsCategory(event.type, event.name);
    const markerColor = getGdacsCategoryColor(category);
    const alertLevel = event.alertlevel?.toLowerCase() || 'green';
    
    // Calculate radius based on alert score (0.1 to 1.0 maps to 4 to 12)
    const radius = 4 + (event.alertscore || 0.5) * 8;
    
    return (
      <CircleMarker
        key={`gdacs-${event.id || 'event'}-${event.lat}-${event.lon}`}
        center={[event.lat, event.lon]}
        radius={Math.min(radius, 12)}
        pathOptions={{
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.7,
          weight: 1
        }}
      >
        <Popup>
          <div className="space-y-1 text-xs">
            <div className="font-semibold">{event.name || 'Unnamed Event'}</div>
            <div>Type: {category.charAt(0).toUpperCase() + category.slice(1)}</div>
            <div>Alert Level: {alertLevel.toUpperCase()}</div>
            {event.country && <div>Location: {event.country}</div>}
            {event.fromdate && (
              <div>Date: {new Date(event.fromdate).toLocaleDateString()}</div>
            )}
          </div>
        </Popup>
      </CircleMarker>
    );
  })}
    </>
  );
};

export default DisasterMarkers;