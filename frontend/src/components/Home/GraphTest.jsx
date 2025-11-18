import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ---------- RAW TEST DATA ----------
const rawData = [
  { x: "2025-01-01", value: 30 },
  { x: "2025-01-02", value: 32 },
  { x: "2025-01-03", value: 35 },
  { x: "2025-01-04", value: 36 },
  { x: "2025-01-05", value: 38 },
  { x: "2025-01-06", value: 34 },
  { x: "2025-01-07", value: 33 },
  { x: "2025-01-08", value: 31 },
  { x: "2025-01-09", value: 29 },
  { x: "2025-01-10", value: 28 },
];

function GraphTest() {
  return (
    <div style={{ width: "90%", margin: "auto", marginTop: "50px" }}>
      <h2 style={{ textAlign: "center" }}>Test Line Graph (Static Data)</h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={rawData}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ff4d4d"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraphTest;
