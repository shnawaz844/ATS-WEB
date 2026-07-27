import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function LineChart({ data = [] }) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={`shadow-lg rounded-lg p-4 text-center transition-colors duration-300 ${theme === "dark" ? "bg-white/10 text-gray-400" : "bg-white text-gray-500"
        }`}>
        No data available
      </div>
    );
  }

  const maxApplications = Math.max(...data.map((d) => d.applications));
  const chartWidth = 600;
  const chartHeight = 300;

  const points = data.map(
    (d, i) => `${(i * (chartWidth / (data.length - 1)))},${chartHeight - (d.applications / maxApplications) * (chartHeight - 60)}`
  ).join(" ");

  return (
    <div className={`shadow-lg rounded-lg p-4 overflow-hidden transition-all duration-300 ${theme === "dark"
        ? "backdrop-blur-xl bg-white/10 border border-white/20"
        : "bg-white border border-gray-100"
      }`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"
        }`}>Application Trend</h3>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        aria-label="Line chart showing application trend"
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((percent) => (
          <line
            key={`grid-${percent}`}
            x1={0}
            y1={chartHeight - (percent * (chartHeight - 60))}
            x2={chartWidth}
            y2={chartHeight - (percent * (chartHeight - 60))}
            className={`stroke-1 ${theme === "dark" ? "stroke-gray-400/30" : "stroke-gray-200"}`}
          />
        ))}

        {/* Line with gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.2" />
          </linearGradient>

          {/* Optional: White gradient for better visibility */}
          <linearGradient id="lineGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="1" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <polyline
          points={points}
          className="fill-none stroke-[3px]"
          style={{
            stroke: 'url(#lineGradientLight)',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }}
        />

        {/* Fill area under line */}
        <polygon
          points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
          style={{
            fill: 'url(#lineGradient)',
            opacity: 0.15
          }}
        />

        {/* Data points and labels */}
        {data.map((d, i) => {
          const x = (i * (chartWidth / (data.length - 1)));
          const y = chartHeight - (d.applications / maxApplications) * (chartHeight - 60);

          return (
            <g key={i} className="group">
              {/* Hover circle */}
              <circle
                cx={x}
                cy={y}
                r="6"
                className="fill-blue-400 opacity-0 
                         group-hover:opacity-100 
                         transition-all duration-300"
              />

              {/* Main data point */}
              <circle
                cx={x}
                cy={y}
                r="4"
                className="fill-blue-400 
                         group-hover:scale-125 
                         transition-transform"
              />

              {/* Date label */}
              <text
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className={`text-xs transition-colors ${theme === "dark"
                    ? "fill-gray-300 group-hover:fill-gray-100"
                    : "fill-gray-500 group-hover:fill-gray-800"
                  }`}
              >
                {d.date.split("-")[2]}
              </text>

              {/* Application count (on hover) */}
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                className={`text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity ${theme === "dark" ? "fill-gray-100" : "fill-gray-800"
                  }`}
              >
                {d.applications}
              </text>
            </g>
          );
        })}

        {/* X and Y axis lines */}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          className={`stroke-2 ${theme === "dark" ? "stroke-gray-400" : "stroke-gray-300"}`}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chartHeight}
          className={`stroke-2 ${theme === "dark" ? "stroke-gray-400" : "stroke-gray-300"}`}
        />
      </svg>
    </div>
  );
}
