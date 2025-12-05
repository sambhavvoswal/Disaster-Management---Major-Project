import React from "react";

const MapLegend = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 text-sm">
      <h3 className="font-bold mb-2">Disaster Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#ef4444] mr-2"></div>
          <span>Earthquakes</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#f43f5e] mr-2"></div>
          <span>Wildfires</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#38bdf8] mr-2"></div>
          <span>Cyclones</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#3b82f6] mr-2"></div>
          <span>Floods</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#a855f7] mr-2"></div>
          <span>Landslides</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b] mr-2"></div>
          <span>Volcanoes</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#f97316] mr-2"></div>
          <span>Heatwaves</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b] mr-2"></div>
          <span>Droughts</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#22c55e] mr-2"></div>
          <span>Other Events</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;