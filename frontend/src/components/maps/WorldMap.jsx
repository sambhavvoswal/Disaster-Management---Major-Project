import React from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DisasterMarkers from "./DisasterMarkers";
import MapLegend from "./MapLegend";

const WorldMap = ({ 
  earthquakes = [], 
  wildfires = [], 
  gdacsEvents = [],
  cyclones = [],
  loading = false,
  error = null 
}) => {
  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            Loading disaster data...
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          {error}
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ZoomControl position="bottomright" />
        
        <DisasterMarkers 
          earthquakes={earthquakes}
          wildfires={wildfires}
          gdacsEvents={gdacsEvents}
          cyclones={cyclones}
        />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-10">
        <MapLegend />
      </div>
    </div>
  );
};

export default WorldMap;