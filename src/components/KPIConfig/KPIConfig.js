import React from 'react';
import './KPIConfig.scss';

export function KPIConfig({ kpis, onUpdate, onClose }) {
  const handleThresholdChange = (kpiId, value) => {
    const updatedKpis = kpis.map(kpi => {
      if (kpi.id === kpiId) {
        return { ...kpi, alertThreshold: parseInt(value) };
      }
      return kpi;
    });
    onUpdate(updatedKpis);
  };

  const handleVisibilityToggle = (kpiId) => {
    const updatedKpis = kpis.map(kpi => {
      if (kpi.id === kpiId) {
        return { ...kpi, hidden: !kpi.hidden };
      }
      return kpi;
    });
    onUpdate(updatedKpis);
  };

  return (
    <div className="kpi-config">
      <div className="kpi-config__header">
        <h3>Configuration des métriques</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="kpi-config__list">
        {kpis.map(kpi => (
          <div key={kpi.id} className="kpi-config__item">
            <div className="kpi-config__item-header">
              <label>
                <input
                  type="checkbox"
                  checked={!kpi.hidden}
                  onChange={() => handleVisibilityToggle(kpi.id)}
                />
                {kpi.name}
              </label>
            </div>
            {kpi.alertThreshold !== undefined && (
              <div className="kpi-config__threshold">
                <label>Seuil d'alerte:</label>
                <input
                  type="number"
                  value={kpi.alertThreshold}
                  onChange={(e) => handleThresholdChange(kpi.id, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 