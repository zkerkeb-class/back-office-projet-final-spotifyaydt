import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCharts } from '../MetricsCharts/MetricsCharts';
import './MetricsCard.scss';

const formatNumber = (value, metricId) => {
  if (typeof value !== 'number') return value;

  // Formatage spécifique selon le type de métrique
  switch (metricId) {
    case 'apiResponseTime':
      // Pour le temps de réponse API (en ms)
      return `${Math.round(value)}ms`;
      
    case 'memory':
      // Pour la mémoire (en MB)
      return `${value.toFixed(2)}MB`;
      
    case 'latency':
      // Pour la latence (en ms)
      return `${Math.round(value)}ms`;
      
    case 'requestsPerSecond':
      // Pour les requêtes par seconde
      return value.toFixed(1);
      
    case 'cpu':
      // Pour le CPU (en pourcentage)
      return `${value.toFixed(2)}%`;
      
    case 'bandwidth':
      // Pour la bande passante
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}GB/s`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(2)}MB/s`;
      } else {
        return `${Math.round(value)}KB/s`;
      }
      
    default:
      // Formatage par défaut pour les grands nombres
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
      }
      return value.toFixed(2);
  }
};

const formatTrend = (value) => {
  if (typeof value !== 'number') return value;
  // Formater le pourcentage de tendance avec un signe et 1 décimale
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export function MetricsCard({ kpi, metrics }) {
  const { t } = useTranslation();

  if (!kpi || !metrics) {
    return null;
  }

  const isAlertTriggered = kpi.alertThreshold && 
    metrics[kpi.id] > kpi.alertThreshold;

  return (
    <div className="metrics-card-container">
      <div className={`metrics-card ${isAlertTriggered ? 'alert' : ''}`}>
        <div className="metrics-card__icon">
          {kpi.icon}
        </div>
        <div className="metrics-card__content">
          <h3 className="metrics-card__title">{t(`dashboard.metrics.${kpi.id}`)}</h3>
          <div className="metrics-card__value">
            {formatNumber(metrics[kpi.id], kpi.id)}
            {metrics[`${kpi.id}Trend`] && (
              <span className={`trend ${metrics[`${kpi.id}Trend`] > 0 ? 'up' : 'down'}`}>
                {formatTrend(metrics[`${kpi.id}Trend`])}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="metric-chart-container">
        <MetricsCharts 
          metricId={kpi.id} 
          metricData={metrics[kpi.id]} 
          alertThreshold={kpi.alertThreshold}
        />
      </div>
    </div>
  );
} 