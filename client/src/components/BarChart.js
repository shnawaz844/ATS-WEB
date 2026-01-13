import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function BarChart({ data = [] }) {
  const { theme } = useTheme();

  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return (
      <div className={`shadow-lg rounded-lg p-4 text-center transition-colors duration-300 ${theme === "dark" ? "bg-white/10 text-gray-400" : "bg-white text-gray-500"
        }`}>
        No data available
      </div>
    );
  }

  // Calculate max applications and define chart dimensions
  const maxApplications = Math.max(...data.map((d) => d.applications));
  const chartWidth = 600;
  const chartHeight = 300;
  const barWidth = 50;
  const gap = 20;

  return (
    <div className={`shadow-lg rounded-lg p-4 overflow-hidden transition-all duration-300 ${theme === "dark"
        ? "backdrop-blur-xl bg-white/10 border border-white/20"
        : "bg-white border border-gray-100"
      }`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"
        }`}>Job Applications</h3>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        aria-label="Bar chart showing job applications"
      >
        {/* Vertical grid lines */}
        {data.map((_, i) => (
          <line
            key={`grid-${i}`}
            x1={(i * (barWidth + gap)) + barWidth / 2}
            y1={0}
            x2={(i * (barWidth + gap)) + barWidth / 2}
            y2={chartHeight - 50}
            className={`stroke-1 ${theme === "dark" ? "stroke-gray-700" : "stroke-gray-200"}`}
          />
        ))}

        {/* Bars with gradient and hover effect */}
        {data.map((d, i) => {
          const barHeight = (d.applications / maxApplications) * (chartHeight - 100);
          return (
            <g key={i} className="group">
              {/* Bar shadow */}
              <rect
                x={(i * (barWidth + gap)) + 5}
                y={chartHeight - barHeight - 40 + 5}
                width={barWidth}
                height={barHeight}
                className={theme === "dark" ? "fill-gray-700 opacity-30" : "fill-gray-100"}
              />

              {/* Main bar with gradient */}
              <rect
                x={i * (barWidth + gap)}
                y={chartHeight - barHeight - 40}
                width={barWidth}
                height={barHeight}
                className="fill-blue-500 transition-all duration-300 
                         group-hover:fill-blue-400 
                         group-hover:scale-105"
                rx="4" // Rounded corners
              />

              {/* Job title */}
              <text
                x={(i * (barWidth + gap)) + barWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                className={`text-xs transition-colors ${theme === "dark"
                    ? "fill-gray-300 group-hover:fill-gray-100"
                    : "fill-gray-500 group-hover:fill-gray-800"
                  }`}
              >
                {d.job ? d.job.split(" ")[0] : 'Job'}
              </text>

              {/* Application count */}
              <text
                x={(i * (barWidth + gap)) + barWidth / 2}
                y={chartHeight - barHeight - 50}
                textAnchor="middle"
                className={`text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity ${theme === "dark" ? "fill-gray-100" : "fill-gray-800"
                  }`}
              >
                {d.applications || 0}
              </text>
            </g>
          );
        })}

        {/* X-axis line */}
        <line
          x1={0}
          y1={chartHeight - 40}
          x2={chartWidth}
          y2={chartHeight - 40}
          className={`stroke-2 ${theme === "dark" ? "stroke-gray-600" : "stroke-gray-300"}`}
        />
      </svg>
    </div>
  );
}