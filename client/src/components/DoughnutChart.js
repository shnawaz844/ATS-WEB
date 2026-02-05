import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data = [], title, applicationStatuses = [] }) {
    const { theme } = useTheme();
    /**
     * Enhanced color mapping that handles various status names
     */
    const getStatusColor = (status) => {
        if (!status) return '#6B7280';

        const statusLower = status.toLowerCase();

        if (statusLower.includes('applied') || statusLower.includes('application'))
            return '#3B82F6'; // blue-500
        if (statusLower.includes('review') || statusLower.includes('screening'))
            return '#F59E0B'; // amber-500
        if (statusLower.includes('interview') || statusLower.includes('meeting'))
            return '#8B5CF6'; // violet-500
        if (statusLower.includes('offer') || statusLower.includes('proposal'))
            return '#10B981'; // emerald-500
        if (statusLower.includes('hired') || statusLower.includes('selected') || statusLower.includes('accepted'))
            return '#059669'; // emerald-600
        if (statusLower.includes('rejected') || statusLower.includes('declined') || statusLower.includes('not selected'))
            return '#EF4444'; // red-500
        if (statusLower.includes('withdrawn') || statusLower.includes('cancelled'))
            return '#6B7280'; // gray-500
        if (statusLower.includes('hold') || statusLower.includes('pending') || statusLower.includes('waiting'))
            return '#F97316'; // orange-500
        if (statusLower.includes('new') || statusLower.includes('received'))
            return '#6366F1'; // indigo-500

        return '#94A3B8'; // slate-400
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="text-4xl mb-2">⭕</div>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No status distribution yet</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Application statuses will be visualized here.</p>
            </div>
        );
    }

    const totalApplications = data.reduce((acc, item) => acc + item.count, 0);

    const chartData = {
        labels: data.map(item => item.status),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: data.map(item => getStatusColor(item.status)),
                borderWidth: 0,
                hoverOffset: 15,
                weight: 2,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                display: false, // We use a custom legend in the dashboard
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(17, 24, 39, 0.95)',
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = ((value / totalApplications) * 100).toFixed(1);
                        return ` ${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1500,
            easing: 'easeOutQuart'
        }
    };

    // Custom plugin to draw text in the center
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: function (chart) {
            const { ctx, width, height } = chart;
            ctx.restore();

            // Draw "Total" label
            const fontSize1 = (height / 180).toFixed(2);
            ctx.font = `500 ${fontSize1}em Inter, system-ui, sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = theme === 'dark' ? '#9CA3AF' : '#6B7280'; // gray-400 : gray-500

            const text1 = "Total";
            const textX1 = Math.round((width - ctx.measureText(text1).width) / 2);
            const textY1 = height / 2 - 15;

            ctx.fillText(text1, textX1, textY1);

            // Draw Count
            const fontSize2 = (height / 120).toFixed(2);
            ctx.font = `700 ${fontSize2}em Inter, system-ui, sans-serif`;
            ctx.fillStyle = theme === 'dark' ? '#FFFFFF' : '#111827'; // white : gray-900

            const text2 = totalApplications.toString();
            const textX2 = Math.round((width - ctx.measureText(text2).width) / 2);
            const textY2 = height / 2 + 15;

            ctx.fillText(text2, textX2, textY2);
            ctx.save();
        }
    };

    return (
        <div className="relative h-full w-full flex flex-col items-center">
            {title && (
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-6 text-center w-full`}>
                    {title}
                </h3>
            )}
            <div className="flex-1 w-full min-h-[250px] relative">
                <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
            </div>
        </div>
    );
}
