"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Restaurant } from '@/types';
import { useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const THB_RATE_FALLBACK = 0.20;

export default function DashboardCharts({ restaurants, exchangeRate = THB_RATE_FALLBACK }: { restaurants: Restaurant[], exchangeRate?: number }) {

    const chartData = useMemo(() => {
        // Dynamic approach: Get all unique cuisines from actual data
        const uniqueCuisines = Array.from(new Set(restaurants.map(r => r.cuisine))).sort();

        // If no data, use default categories to show empty chart
        const categories = uniqueCuisines.length > 0 ? uniqueCuisines : ['Yakiniku', 'Sushi', 'Fried', 'Ramen', 'Rice', 'Izakaya'];

        const avgData = categories.map(cat => {
            const subset = restaurants.filter(d => d.cuisine === cat);
            if (!subset.length) return 0;
            const total = subset.reduce((sum, item) => sum + (item.price * exchangeRate), 0);
            return Math.round(total / subset.length);
        });

        // Generate Colors dynamically
        const backgroundColors = categories.map((_, i) => `hsl(${i * 60 + 200}, 70%, 70%)`);

        return {
            labels: categories,
            datasets: [
                {
                    label: 'บาท (เฉลี่ย)',
                    data: avgData,
                    backgroundColor: backgroundColors,
                    borderRadius: 4,
                    barThickness: 30,
                },
            ],
        };
    }, [restaurants, exchangeRate]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">งบประมาณเฉลี่ย (บาท) ตามประเภท</h3>
            <div className="flex-grow w-full h-[150px]">
                <Bar options={options as any} data={chartData} />
            </div>
        </div>
    );
}
