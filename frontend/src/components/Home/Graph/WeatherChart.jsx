import React from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Custom tick formatter for the X-axis (shows the date and hour)
const formatXAxis = (tick) => {
    const date = new Date(tick);
    // Format to "18 Nov 12:00" - use date/hour for a dense hourly chart
    return `${date.getHours()}:00`; 
};

// Custom Tooltip component to show all data clearly
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const date = new Date(label);
        const day = date.toLocaleString('en-US', { day: 'numeric', month: 'short' });
        const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return (
            <div style={{ backgroundColor: '#333', border: '1px solid #555', padding: '10px', color: '#fff' }}>
                <p className="label">**{day} {time}**</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }}>
                        {p.name}: **{p.value}** {p.unit}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


const WeatherChart = ({ data }) => {
    // Determine the min/max for the Y-axes based on the data if needed, 
    // or use fixed values (like 0 to 0.5 for rain as in the source chart).

    // For a dark theme:
    const axisColor = '#999';
    const gridColor = '#333';
    
    // We assume data is hourly, spanning several days
    const minTemp = Math.min(...data.map(d => d.temp), ...data.map(d => d.apparentTemp)) - 2;
    const maxTemp = Math.max(...data.map(d => d.temp), ...data.map(d => d.apparentTemp)) + 2;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          {/* Grid matching the dark theme */}
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          
          {/* X-Axis for Time/Date */}
          <XAxis 
            dataKey="time" 
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 10 }}
            tickFormatter={formatXAxis}
          />
          
          {/* LEFT Y-Axis for Temperature (°C) and Humidity (%) */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 10 }}
            domain={[minTemp, maxTemp]} // Dynamic temperature range
            unit="°C"
          />

          {/* RIGHT Y-Axis for Rain (mm) and Precipitation Probability (%) */}
          {/* NOTE: Rain (mm) is tiny, so we use a small max range (e.g., 0.5) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke={axisColor} 
            tick={{ fill: axisColor, fontSize: 10 }}
            domain={[0, 100]} // Rain probability is 0-100%
          />
          
          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend */}
          <Legend wrapperStyle={{ color: axisColor, paddingTop: '10px' }} />

          {/* DATA SERIES */}
          
          {/* RAIN as a Bar Chart (Blue bars, uses right axis, uses the `rain` value) */}
          <Bar 
            yAxisId="right" 
            dataKey="rain" 
            fill="rgba(173, 216, 230, 0.6)" // Light blue for rain bars
            name="Rain (mm/h)"
            barSize={2} // Narrow bars for hourly data
            unit="mm"
          />
          
          {/* TEMPERATURE_2m (Blue Line, uses left Y-axis, uses the `temp` value) */}
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="temp" 
            stroke="#8884d8" // Standard Blue/Violet
            dot={false}
            strokeWidth={2}
            name="Temperature (°C)"
            unit="°C"
          />

          {/* RELATIVE_HUMIDITY_2m (Purple Line, uses left Y-axis, uses the `humidity` value) */}
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="humidity" 
            stroke="#9c27b0" // Purple
            dot={false}
            strokeWidth={2}
            name="Humidity (%)"
            unit="%"
          />

          {/* APPARENT_TEMPERATURE (Green Line, uses left Y-axis, uses the `apparentTemp` value) */}
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="apparentTemp" 
            stroke="#4caf50" // Green
            dot={false}
            strokeWidth={2}
            name="Apparent Temp (°C)"
            unit="°C"
          />
          
          {/* PRECIPITATION_PROBABILITY (Orange Line, uses right Y-axis, uses the `rainProb` value) */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="rainProb" 
            stroke="#ff9800" // Orange
            dot={false}
            strokeWidth={2}
            name="Precip. Prob. (%)"
            unit="%"
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherChart;