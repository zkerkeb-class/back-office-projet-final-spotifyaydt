import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './KPIConfig.scss';

export function KPIConfig({ kpis = [], onUpdate, onClose }) {
  const { t } = useTranslation();
  const [localKpis, setLocalKpis] = useState(kpis);

  const handleThresholdChange = (kpiId, value) => {
    setLocalKpis(prevKpis => 
      prevKpis.map(kpi => 
        kpi.id === kpiId 
          ? { 
              ...kpi, 
              alertThreshold: value === '' ? undefined : parseInt(value)
            }
          : kpi
      )
    );
  };

  const handleVisibilityToggle = (kpiId) => {
    setLocalKpis(prevKpis => 
      prevKpis.map(kpi => 
        kpi.id === kpiId 
          ? { ...kpi, hidden: !kpi.hidden }
          : kpi
      )
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onUpdate(localKpis);
    onClose();
  };

  return (
    <div className="kpi-config-overlay" onClick={handleOverlayClick}>
      <div className="kpi-config">
        <div className="kpi-config__header">
          <h3>{t('dashboard.configuration')}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="kpi-config__list">
          {localKpis.map(kpi => (
            <div key={kpi.id} className="kpi-config__item">
              <div className="kpi-config__item-header">
                <label>
                  <input
                    type="checkbox"
                    checked={!kpi.hidden}
                    onChange={() => handleVisibilityToggle(kpi.id)}
                  />
                  {t(`dashboard.metrics.${kpi.id}`)}
                </label>
              </div>
              <div className="kpi-config__threshold">
                <label>{t('dashboard.alertThreshold')}:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kpi.alertThreshold || ''}
                  onChange={(e) => handleThresholdChange(kpi.id, e.target.value)}
                  placeholder={t('dashboard.noThreshold')}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="kpi-config__actions">
          <button className="btn btn--secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn--primary" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
} 