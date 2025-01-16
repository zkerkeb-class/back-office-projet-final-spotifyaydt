import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { MetricsCard } from '../../components/MetricsCard/MetricsCard';
import { FaCog } from 'react-icons/fa';
import { KPIConfig } from '../../components/KPIConfig/KPIConfig';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Dashboard.scss';
import { useTranslation } from '../../hooks/useTranslation';

// Déplaçons les fonctions de formatage dans un objet séparé
const formatters = {
  apiResponseTime: (value) => `${value?.toFixed(2) || 0} ms`,
  cpuUsage: (value) => `${value?.toFixed(1) || 0}%`,
  memoryUsage: (value) => `${value?.toFixed(1) || 0}%`,
  redisLatency: (value) => `${value?.toFixed(2) || 0} ms`,
  bandwidth: (value) => `${((value || 0) / 1024 / 1024).toFixed(2)} MB/s`,
  requestsPerSecond: (value) => value || 0,
};

// Configuration par défaut des KPIs
const defaultKPIs = [
  {
    id: 'apiResponseTime',
    name: 'Temps de réponse API',
    icon: '⚡',
  },
  {
    id: 'cpuUsage',
    name: 'CPU',
    icon: '🔧',
    alertThreshold: 80,
  },
  {
    id: 'memoryUsage',
    name: 'Mémoire',
    icon: '💾',
    alertThreshold: 80,
  },
  {
    id: 'redisLatency',
    name: 'Latence Redis',
    icon: '⚡',
  },
  {
    id: 'bandwidth',
    name: 'Bande passante',
    icon: '📊',
  },
  {
    id: 'requestsPerSecond',
    name: 'Requêtes/sec',
    icon: '🔄',
  },
];

function SortableMetricsCard({ kpi, metrics }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MetricsCard
        title={kpi.name}
        value={formatters[kpi.id](metrics[kpi.id])}
        trend={metrics[`${kpi.id}Trend`]}
        icon={kpi.icon}
        alert={kpi.alertThreshold && metrics[kpi.id] > kpi.alertThreshold}
      />
    </div>
  );
}

function Dashboard() {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('kpiConfig');
    return saved ? JSON.parse(saved) : { kpis: defaultKPIs };
  });
  const t = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => api.get('/metrics/system'),
    refetchInterval: 5000,
    retry: 2,
  });

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Chargement des métriques système...</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!metrics) return null;

  const handleConfigUpdate = (updatedKpis) => {
    const newConfig = { ...config, kpis: updatedKpis };
    setConfig(newConfig);
    localStorage.setItem('kpiConfig', JSON.stringify(newConfig));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = config.kpis.findIndex((kpi) => kpi.id === active.id);
      const newIndex = config.kpis.findIndex((kpi) => kpi.id === over.id);

      const newKpis = arrayMove(config.kpis, oldIndex, newIndex);
      handleConfigUpdate(newKpis);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h2>{t('dashboard.title')}</h2>
        <div className="dashboard__controls">
          <span className="dashboard__refresh">
            Actualisation automatique toutes les 5 secondes
          </span>
          <button className="dashboard__config-btn" onClick={() => setShowConfig(!showConfig)}>
            <FaCog /> Configuration
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={(config.kpis || defaultKPIs).filter(kpi => !kpi.hidden).map(kpi => kpi.id)}
          strategy={rectSortingStrategy}
        >
          <div className="dashboard__metrics-grid">
            {(config.kpis || defaultKPIs)
              .filter(kpi => !kpi.hidden)
              .map((kpi) => (
                <SortableMetricsCard
                  key={kpi.id}
                  kpi={kpi}
                  metrics={metrics}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {showConfig && (
        <KPIConfig
          kpis={config.kpis || defaultKPIs}
          onUpdate={handleConfigUpdate}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

export default Dashboard; 