import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './MetricsCharts.scss';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export const MetricsCharts = ({ metricId, metricData, alertThreshold }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const maxDataPoints = 20; // Nombre de points à afficher

  const getGradient = useCallback((ctx) => {
    if (!ctx) return null;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0)');
    return gradient;
  }, []);

  useEffect(() => {
    setHistoricalData(prevData => {
      const now = new Date();
      const newDataPoint = {
        timestamp: now.getTime(),
        date: now.toLocaleTimeString(),
        value: metricData
      };

      // Ajouter le nouveau point et garder seulement les derniers points
      const updatedData = [...prevData, newDataPoint]
        .slice(-maxDataPoints);

      return updatedData;
    });
  }, [metricData]);

  const chartData = {
    labels: historicalData.map(item => item.date),
    datasets: [
      {
        label: metricId,
        data: historicalData.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx} = chart;
          return getGradient(ctx);
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const formatYAxisValue = (value, metricId) => {
    switch (metricId) {
      case 'memory':
        return Number(value).toFixed(2);
      case 'cpu':
        return `${Number(value).toFixed(2)}%`;
      case 'apiResponseTime':
      case 'latency':
        return `${Math.round(value)}ms`;
      default:
        if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'k';
        }
        return value;
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: 'rgba(75, 192, 192, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = formatYAxisValue(context.parsed.y, metricId);
            switch (metricId) {
              case 'memory':
                return `Mémoire: ${value}MB`;
              case 'cpu':
                return `CPU: ${value}`;
              case 'apiResponseTime':
                return `Temps de réponse: ${value}`;
              case 'latency':
                return `Latence: ${value}`;
              default:
                return `Valeur: ${value}`;
            }
          }
        }
      },
      annotation: alertThreshold ? {
        annotations: {
          alertLine: {
            type: 'line',
            yMin: alertThreshold,
            yMax: alertThreshold,
            borderColor: 'rgba(255, 68, 68, 0.7)',
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Seuil d\'alerte',
              position: 'end',
              backgroundColor: 'rgba(255, 68, 68, 0.7)',
              color: 'white',
              padding: 4
            }
          }
        }
      } : undefined
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          maxTicksLimit: 5,
          color: '#666'
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#666',
          padding: 10,
          callback: (value) => formatYAxisValue(value, metricId)
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="metric-chart">
      <Line data={chartData} options={options} />
    </div>
  );
}; 