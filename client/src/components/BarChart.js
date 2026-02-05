import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ data = [] }) {
  const { theme } = useTheme();
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return (
      <div className={`${theme === 'dark' ? 'bg-[#121212] border border-gray-800 text-gray-400' : 'bg-white text-gray-500'} rounded-lg p-4 text-center flex flex-col items-center justify-center h-full min-h-[300px]`}>
        <div className="text-4xl mb-2">📊</div>
        <p className="font-medium">No application data yet</p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Applications will appear here once candidates apply.</p>
      </div>
    );
  }

  // Debug logging
  console.log('BarChart rendering with data:', data);

  const chartData = {
    labels: data.map(d => d.job.length > 15 ? d.job.substring(0, 15) + '...' : d.job),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.applications),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.8)'); // blue-500
          gradient.addColorStop(1, 'rgba(37, 99, 235, 1)');   // blue-600
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(30, 64, 175, 1)', // blue-800
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return data[index].job; // Show full job title in tooltip
          },
          label: (context) => `Applications: ${context.formattedValue}`,
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280', // gray-400 : gray-500
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? '#1F2937' : '#F3F4F6', // gray-800 : gray-100
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
          },
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}