import React from 'react';
import { useTranslation } from 'react-i18next';
import './MetricsCard.scss';

const formatNumber = (value) => {
  if (typeof value === 'number') {
    return Number(value.toFixed(2));
  }
  return value;
};

export function MetricsCard({ kpi, metrics }) {
  const { t } = useTranslation();

  if (!kpi || !metrics) {
    return null;
  }

  const isAlertTriggered = kpi.alertThreshold && 
    metrics[kpi.id] > kpi.alertThreshold;

  return (
    <div className={`metrics-card ${isAlertTriggered ? 'alert' : ''}`}>
      <div className="metrics-card__icon">
        {kpi.icon}
      </div>
      <div className="metrics-card__content">
        <h3 className="metrics-card__title">{t(`dashboard.metrics.${kpi.id}`)}</h3>
        <div className="metrics-card__value">
          {formatNumber(metrics[kpi.id])}
          {metrics[`${kpi.id}Trend`] && (
            <span className={`trend ${metrics[`${kpi.id}Trend`] > 0 ? 'up' : 'down'}`}>
              {formatNumber(metrics[`${kpi.id}Trend`])}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 