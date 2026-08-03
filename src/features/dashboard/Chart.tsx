'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { MonthlyData } from '@/lib/types';

Chart.register(...registerables);

interface MonthlyChartProps {
  data: MonthlyData[];
  type?: 'bar' | 'line';
}

export function MonthlyChart({ data, type = 'bar' }: MonthlyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(226, 232, 240, 0.8)';
    const textColor = isDark ? '#a7f3d0' : '#64748b';

    chartRef.current = new Chart(ctx, {
      type,
      data: {
        labels: data.map((d) => d.month),
        datasets: [
          {
            label: 'إيرادات',
            data: data.map((d) => d.revenue),
            backgroundColor: type === 'bar' ? 'rgba(16, 185, 129, 0.85)' : 'transparent',
            borderColor: '#10b981',
            borderWidth: 2,
            borderRadius: type === 'bar' ? 6 : 0,
            tension: 0.4,
            fill: type === 'line',
            pointBackgroundColor: '#10b981',
            pointRadius: type === 'line' ? 3 : 0,
          },
          {
            label: 'نفقات',
            data: data.map((d) => d.expense),
            backgroundColor: type === 'bar' ? 'rgba(239, 68, 68, 0.85)' : 'transparent',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderRadius: type === 'bar' ? 6 : 0,
            tension: 0.4,
            fill: type === 'line',
            pointBackgroundColor: '#ef4444',
            pointRadius: type === 'line' ? 3 : 0,
          },
          {
            label: 'مسترجعات',
            data: data.map((d) => d.returns),
            backgroundColor: type === 'bar' ? 'rgba(245, 158, 11, 0.85)' : 'transparent',
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderRadius: type === 'bar' ? 6 : 0,
            tension: 0.4,
            fill: type === 'line',
            pointBackgroundColor: '#f59e0b',
            pointRadius: type === 'line' ? 3 : 0,
          },
          {
            label: 'رواتب',
            data: data.map((d) => d.salary),
            backgroundColor: type === 'bar' ? 'rgba(139, 92, 246, 0.85)' : 'transparent',
            borderColor: '#8b5cf6',
            borderWidth: 2,
            borderRadius: type === 'bar' ? 6 : 0,
            tension: 0.4,
            fill: type === 'line',
            pointBackgroundColor: '#8b5cf6',
            pointRadius: type === 'line' ? 3 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            rtl: true,
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: {
                family: 'Cairo, sans-serif',
                size: 11,
              },
            },
          },
          tooltip: {
            rtl: true,
            backgroundColor: isDark ? '#0f1c16' : '#ffffff',
            titleColor: isDark ? '#ecfdf5' : '#0f172a',
            bodyColor: isDark ? '#a7f3d0' : '#64748b',
            borderColor: isDark ? '#1b382b' : '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            titleFont: {
              family: 'IBM Plex Sans Arabic, sans-serif',
              weight: 'bold',
            },
            bodyFont: {
              family: 'IBM Plex Sans Arabic, sans-serif',
            },
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y;
                return `${ctx.dataset.label}: ${val != null ? val.toLocaleString('ar-SA') : 0} ر.س`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: 'IBM Plex Sans Arabic, sans-serif', size: 10 },
            },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'IBM Plex Sans Arabic, sans-serif', size: 10 },
              callback: (val) => `${Number(val).toLocaleString('ar-SA')}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, type]);

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80">
      <canvas ref={canvasRef} />
    </div>
  );
}
