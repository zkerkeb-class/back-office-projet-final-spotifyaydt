import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { MetricsCard } from '../../components/MetricsCard/MetricsCard';
import './Dashboard.scss';

function Dashboard() {
  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => api.get('/metrics/system'),
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    retry: 2,
  });

  if (isLoading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Chargement des métriques système...</p>
    </div>
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // Vérifier si metrics existe avant de l'utiliser
  if (!metrics) return null;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h2>Tableau de bord système</h2>
        <span className="dashboard__refresh">
          Actualisation automatique toutes les 5 secondes
        </span>
      </div>

      <div className="dashboard__metrics-grid">
        <MetricsCard
          title="Temps de réponse API"
          value={`${metrics?.apiResponseTime?.toFixed(2) || 0} ms`}
          trend={metrics?.apiResponseTimeTrend || 0}
          icon="⚡"
        />
        
        <MetricsCard
          title="CPU"
          value={`${metrics?.cpuUsage?.toFixed(1) || 0}%`}
          trend={metrics?.cpuTrend || 0}
          icon="🔧"
          alert={metrics?.cpuUsage > 80}
        />

        <MetricsCard
          title="Mémoire"
          value={`${metrics?.memoryUsage?.toFixed(1) || 0}%`}
          trend={metrics?.memoryTrend || 0}
          icon="💾"
          alert={metrics?.memoryUsage > 80}
        />

        <MetricsCard
          title="Latence Redis"
          value={`${metrics?.redisLatency?.toFixed(2) || 0} ms`}
          trend={metrics?.redisLatencyTrend || 0}
          icon="⚡"
        />

        <MetricsCard
          title="Bande passante"
          value={`${((metrics?.bandwidth || 0) / 1024 / 1024).toFixed(2)} MB/s`}
          trend={metrics?.bandwidthTrend || 0}
          icon="📊"
        />

        <MetricsCard
          title="Requêtes/sec"
          value={metrics?.requestsPerSecond || 0}
          trend={metrics?.requestsTrend || 0}
          icon="🔄"
        />
      </div>

      <div className="dashboard__charts">
        {/* Nous ajouterons des graphiques ici plus tard */}
      </div>
    </div>
  );
}

export default Dashboard; 