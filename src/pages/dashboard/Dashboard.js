import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { MetricsCard } from '../../components/MetricsCard/MetricsCard';
import { FaCog } from 'react-icons/fa';
import { KPIConfig } from '../../components/KPIConfig/KPIConfig';
import { useTranslation } from 'react-i18next';
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

const defaultKPIs = [
  {
    id: 'apiResponseTime',
    icon: '⚡',
  },
  {
    id: 'cpuUsage',
    icon: '🔧',
    alertThreshold: 80,
  },
  {
    id: 'memoryUsage',
    icon: '💾',
    alertThreshold: 80,
  },
  {
    id: 'redisLatency',
    icon: '⚡',
  },
  {
    id: 'bandwidth',
    icon: '📊',
  },
  {
    id: 'requestsPerSecond',
    icon: '🔄',
  },
];

const formatters = {
  apiResponseTime: (value) => `${value}ms`,
  cpuUsage: (value) => `${value}%`,
  memoryUsage: (value) => `${value}%`,
  redisLatency: (value) => `${value}ms`,
  bandwidth: (value) => `${value}MB/s`,
  requestsPerSecond: (value) => value,
};

function SortableMetricsCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MetricsCard {...props} />
    </div>
  );
}

function Dashboard() {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('kpiConfig');
    return saved ? JSON.parse(saved) : { kpis: defaultKPIs };
  });
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => api.get('/metrics/system'),
    refetchInterval: 5000,
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setConfig((prevConfig) => {
        const oldIndex = prevConfig.kpis.findIndex((kpi) => kpi.id === active.id);
        const newIndex = prevConfig.kpis.findIndex((kpi) => kpi.id === over.id);

        return {
          ...prevConfig,
          kpis: arrayMove(prevConfig.kpis, oldIndex, newIndex),
        };
      });
    }
  };

  const handleConfigUpdate = (updatedKpis) => {
    const newConfig = { ...config, kpis: updatedKpis };
    setConfig(newConfig);
    localStorage.setItem('kpiConfig', JSON.stringify(newConfig));
    setShowConfig(false);
  };

  if (isError) {
    return <ErrorState error={error} />;
  }

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{t('dashboard.loading')}</p>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h2>{t('dashboard.title')}</h2>
        <div className="dashboard__controls">
          <span className="dashboard__refresh">
            {t('dashboard.refresh')}
          </span>
          <button 
            className="dashboard__config-btn" 
            onClick={() => setShowConfig(!showConfig)}
            aria-label={t('dashboard.configuration')}
          >
            <FaCog /> {t('dashboard.configuration')}
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="dashboard__metrics">
          <SortableContext items={config.kpis.map(kpi => kpi.id)} strategy={rectSortingStrategy}>
            {config.kpis
              .filter(kpi => !kpi.hidden)
              .map((kpi) => (
                <SortableMetricsCard
                  key={kpi.id}
                  kpi={kpi}
                  metrics={metrics}
                />
              ))}
          </SortableContext>
        </div>
      </DndContext>

      {showConfig && (
        <KPIConfig
          kpis={config.kpis}
          onUpdate={handleConfigUpdate}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

export default Dashboard; 