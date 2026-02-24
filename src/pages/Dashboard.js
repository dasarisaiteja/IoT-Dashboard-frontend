

import React, { useState, useEffect } from 'react';
import { getLatestReadings, getSensorStats, getRecentAlerts, getAlertStats } from '../api/api';


function formatTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}



// A card showing a single sensor device's latest readings
function SensorCard({ reading }) {
  return (
    <div className="sensor-card">
      <div className="sensor-card-header">
        <div>
          <div className="sensor-topic">{reading.topic}</div>
          <div className="sensor-time">Last seen: {formatTime(reading.received_at)}</div>
        </div>
        <span className="badge badge-ok">ONLINE</span>
      </div>
      
      {/* Showing each sensor value */}
      <div className="sensor-values">
        {reading.temperature !== null && reading.temperature !== undefined && (
          <div className="sensor-value-item">
            <div className="sensor-value-label">🌡️ Temp</div>
            <div className="sensor-value-number">
              {reading.temperature.toFixed(1)}
              <span className="sensor-value-unit">°C</span>
            </div>
          </div>
        )}
        {reading.humidity !== null && reading.humidity !== undefined && (
          <div className="sensor-value-item">
            <div className="sensor-value-label">💧 Humidity</div>
            <div className="sensor-value-number">
              {reading.humidity.toFixed(1)}
              <span className="sensor-value-unit">%</span>
            </div>
          </div>
        )}
        {reading.voltage !== null && reading.voltage !== undefined && (
          <div className="sensor-value-item">
            <div className="sensor-value-label">⚡ Voltage</div>
            <div className="sensor-value-number">
              {reading.voltage.toFixed(1)}
              <span className="sensor-value-unit">V</span>
            </div>
          </div>
        )}
        {reading.current !== null && reading.current !== undefined && (
          <div className="sensor-value-item">
            <div className="sensor-value-label">🔌 Current</div>
            <div className="sensor-value-number">
              {reading.current.toFixed(2)}
              <span className="sensor-value-unit">A</span>
            </div>
          </div>
        )}
        {reading.pressure !== null && reading.pressure !== undefined && (
          <div className="sensor-value-item">
            <div className="sensor-value-label">🌬️ Pressure</div>
            <div className="sensor-value-number">
              {reading.pressure.toFixed(1)}
              <span className="sensor-value-unit">hPa</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



//  A single alert item for the recent alerts list

function AlertItem({ alert }) {
  const isCritical = alert.severity === 'CRITICAL';
  
  return (
    <div className={`alert-item ${isCritical ? '' : 'warning'}`}>
      <div className="alert-item-header">
        <div className="alert-topic">📍 {alert.topic}</div>
        <div className="alert-time">{formatTime(alert.created_at)}</div>
      </div>
      
      <span className={`badge ${isCritical ? 'badge-critical' : 'badge-warning'}`}>
        {alert.severity}
      </span>
      
      {/* Showing which sensors violated their thresholds */}
      <div className="alert-violations">
        {alert.violated_keys.map((key) => (
          <span key={key} className={`violation-tag ${isCritical ? '' : 'warning'}`}>
            {key}: {alert.actual_values[key]?.toFixed ? alert.actual_values[key].toFixed(2) : alert.actual_values[key]}
          </span>
        ))}
      </div>
    </div>
  );
}
// MAIN DASHBOARD COMPONENT


function Dashboard() {
  const [latestReadings, setLatestReadings] = useState([]);
  const [sensorStats, setSensorStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//  Loading all the data we need for the dashboard

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      // Loading everything at the same time using Promise.all for speed
      const [readings, stats, alerts, aStats] = await Promise.all([
        getLatestReadings(),
        getSensorStats(),
        getRecentAlerts(5),     // Only get 5 most recent
        getAlertStats()
      ]);
      
      setLatestReadings(readings.data || []);
      setSensorStats(stats);
      setRecentAlerts(alerts.data || []);
      setAlertStats(aStats);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load data. Is the backend running? Check the console for details.');
    } finally {
      setLoading(false);
    }
  }


  // The empty [] means "only run once when the component first loads"
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds to show fresh data
    const refreshInterval = setInterval(loadDashboardData, 30000);
    
    // Cleanup: stop the interval when the component is removed
    return () => clearInterval(refreshInterval);
  }, []);


  // Show loading state
  if (loading) {
    return <div className="loading-text">⏳ Loading dashboard data...</div>;
  }

  // Show error state
  if (error) {
    return (
      <div>
        <div className="error-text">❌ {error}</div>
        <div style={{ textAlign: 'center' }}>
          <button className="refresh-btn" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Live sensor monitoring — auto-refreshes every 30 seconds</p>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          🔄 Refresh Now
        </button>
      </div>
      
      
      {/* ---- STATS CARDS ---- */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">📊 Total Readings</div>
          <div className="stat-value">{sensorStats?.total_readings?.toLocaleString() ?? '—'}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">📡 Active Devices</div>
          <div className="stat-value">{sensorStats?.total_topics ?? '—'}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">🚨 Total Alerts</div>
          <div className="stat-value">{alertStats?.total_alerts ?? '—'}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">⚠️ Critical Alerts</div>
          <div className="stat-value">{alertStats?.critical_alerts ?? '—'}</div>
        </div>
      </div>
      
      
      {/* ---- SENSOR READINGS GRID ---- */}
      <div className="card">
        <div className="card-title">Latest Sensor Readings</div>
        {latestReadings.length === 0 ? (
          <p className="empty-text">
            No sensor data yet. Make sure your MQTT devices are publishing messages.
          </p>
        ) : (
          <div className="sensors-grid">
            {latestReadings.map((reading) => (
              <SensorCard key={reading.id} reading={reading} />
            ))}
          </div>
        )}
      </div>
      
      
      {/* ---- RECENT ALERTS ---- */}
      <div className="card">
        <div className="card-title">Recent Alerts</div>
        {recentAlerts.length === 0 ? (
          <p className="empty-text">✅ No recent alerts — all systems normal!</p>
        ) : (
          recentAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>
      
    </div>
  );
}

export default Dashboard;
