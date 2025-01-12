import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './MetricsCard.scss';

export const MetricsCard = ({ title, value, trend, icon, alert }) => {
  const getTrendIcon = () => {
    if (trend > 0) return <FaArrowUp className="trend-icon trend-icon--up" />;
    if (trend < 0) return <FaArrowDown className="trend-icon trend-icon--down" />;
    return null;
  };

  return (
    <div className={`metrics-card ${alert ? 'metrics-card--alert' : ''}`}>
      <div className="metrics-card__icon">{icon}</div>
      <div className="metrics-card__content">
        <h3 className="metrics-card__title">{title}</h3>
        <div className="metrics-card__value">
          {value}
          {trend !== undefined && (
            <span className="metrics-card__trend">
              {getTrendIcon()}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 