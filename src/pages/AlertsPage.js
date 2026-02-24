import React, { useState, useEffect } from 'react';
import { getAlerts, getAlertStats, getAllTopics } from '../api/api';


//  Format a date string into readable format

function formatTime(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}


function AlertsPage() {
  // State for alerts data
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [severityFilter, setSeverityFilter] = useState('');  // '' means "all"
  const [topicFilter, setTopicFilter] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const PAGE_SIZE = 15;


//  Fetching alerts based on current filters and page
  
  async function loadAlerts() {
    try {
      setLoading(true);
      setError(null);
      
      // Loading alerts and topics at the same time
      const [alertsData, topicsData, statsData] = await Promise.all([
        getAlerts({
          page: currentPage,
          pageSize: PAGE_SIZE,
          severity: severityFilter || null,
          topic: topicFilter || null,
        }),
        getAllTopics(),
        getAlertStats()
      ]);
      
      setAlerts(alertsData.data || []);
      setPagination(alertsData.pagination);
      setTopics(topicsData.topics || []);
      setAlertStats(statsData);
      
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Could not load alerts. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  // Loading when component mounts or when filters/page change
  useEffect(() => {
    loadAlerts();
  }, [currentPage, severityFilter, topicFilter]);

  // When filters change, reset to page 1
  function handleFilterChange(filterSetter, value) {
    filterSetter(value);
    setCurrentPage(1);  // Go back to first page when filtering
  }


  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Alerts</h2>
        <p className="page-subtitle">Sensor threshold violations and system warnings</p>
      </div>
      
      
      {/* ---- ALERT STATS ---- */}
      {alertStats && (
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card blue">
            <div className="stat-label">Total Alerts</div>
            <div className="stat-value">{alertStats.total_alerts}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Critical</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{alertStats.critical_alerts}</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-label">Warnings</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{alertStats.warning_alerts}</div>
          </div>
        </div>
      )}
      
      
      {/* ---- FILTERS ---- */}
      <div className="filters-row">
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#555' }}>Filter by:</label>
        
        {/* Severity filter dropdown */}
        <select
          className="filter-select"
          value={severityFilter}
          onChange={(e) => handleFilterChange(setSeverityFilter, e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="WARNING">Warning Only</option>
        </select>
        
        {/* Topic filter dropdown */}
        <select
          className="filter-select"
          value={topicFilter}
          onChange={(e) => handleFilterChange(setTopicFilter, e.target.value)}
        >
          <option value="">All Devices</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        
        <button className="refresh-btn" onClick={loadAlerts}>
          🔄 Refresh
        </button>
      </div>
      
      
      {/* ---- ALERTS LIST ---- */}
      {loading ? (
        <div className="loading-text">⏳ Loading alerts...</div>
      ) : error ? (
        <div className="error-text">❌ {error}</div>
      ) : alerts.length === 0 ? (
        <div className="card">
          <p className="empty-text">✅ No alerts found for the selected filters!</p>
        </div>
      ) : (
        <>
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
          
          {/* ---- PAGINATION ---- */}
          {pagination && pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage <= 1}
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {pagination.total_pages}
                ({pagination.total_count} total alerts)
              </span>
              
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= pagination.total_pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// alert card showing all alert details

function AlertRow({ alert }) {
  const isCritical = alert.severity === 'CRITICAL';
  
  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${isCritical ? '#dc2626' : '#d97706'}`,
        marginBottom: '12px'
      }}
    >
      {/* Alert Header: topic + time + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
            📍 {alert.topic}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>
            🕐 {formatTime(alert.created_at)}
          </div>
        </div>
        <span className={`badge ${isCritical ? 'badge-critical' : 'badge-warning'}`}>
          {isCritical ? '🔴' : '🟡'} {alert.severity}
        </span>
      </div>
      
      {/* Violated Parameters - show which sensors crossed thresholds */}
      <div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>
          Violated Parameters:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {alert.violated_keys.map((key) => {
            const actualVal = alert.actual_values[key];
            const thresholds = alert.threshold_values?.[key];
            
            return (
              <div
                key={key}
                style={{
                  background: isCritical ? '#fee2e2' : '#fef3c7',
                  border: `1px solid ${isCritical ? '#fca5a5' : '#fcd34d'}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px'
                }}
              >
                {/* Sensor name */}
                <div style={{ fontWeight: 600, color: isCritical ? '#dc2626' : '#d97706', marginBottom: '2px' }}>
                  {key.toUpperCase()}
                </div>
                {/* Actual value */}
                <div style={{ color: '#333' }}>
                  Value: <strong>{typeof actualVal === 'number' ? actualVal.toFixed(2) : actualVal}</strong>
                </div>
                {/* Allowed range */}
                {thresholds && (
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                    Allowed: {thresholds.min} – {thresholds.max}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export default AlertsPage;
