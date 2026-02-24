import React, { useState, useEffect } from 'react';
import { getSensorReadings, getAllTopics } from '../api/api';


// Format date for display in table

function formatTime(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Format a number to 2 decimal places, or show '—' if null

function formatValue(value, unit = '') {
  if (value === null || value === undefined) return '—';
  return `${parseFloat(value).toFixed(2)}${unit}`;
}


function RawDataPage() {
  // Data state
  const [readings, setReadings] = useState([]);
  const [topics, setTopics] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [topicFilter, setTopicFilter] = useState('');
  const [startTime, setStartTime] = useState('');  // ISO date string
  const [endTime, setEndTime] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;


// Loading data based on current filters and page
   
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [readingsData, topicsData] = await Promise.all([
        getSensorReadings({
          page: currentPage,
          pageSize: PAGE_SIZE,
          topic: topicFilter || null,
          startTime: startTime || null,
          endTime: endTime || null,
        }),
        getAllTopics()
      ]);
      
      setReadings(readingsData.data || []);
      setPagination(readingsData.pagination);
      setTopics(topicsData.topics || []);
      
    } catch (err) {
      console.error('Failed to load raw data:', err);
      setError('Could not load sensor data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  // Loading when page or filters change
  useEffect(() => {
    loadData();
  }, [currentPage]);  // When filters change, manually call applyFilters

// Apply filters and reset to page 1

  function applyFilters() {
    setCurrentPage(1);  // Go back to page 1 when filtering
    loadData();
  }

  
// Clear all filters

  function clearFilters() {
    setTopicFilter('');
    setStartTime('');
    setEndTime('');
    setCurrentPage(1);

  }


  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Raw Sensor Data</h2>
        <p className="page-subtitle">
          All incoming sensor readings — {pagination ? `${pagination.total_count.toLocaleString()} total records` : '...'}
        </p>
      </div>
      
      
      {/* ---- FILTERS ---- */}
      <div className="card">
        <div className="card-title">Filter Data</div>
        <div className="filters-row">
          
          {/* Topic/Device filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Device / Topic
            </label>
            <select
              className="filter-select"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            >
              <option value="">All Devices</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          
          {/* Start time filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              From (Start Time)
            </label>
            <input
              type="datetime-local"
              className="filter-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          
          {/* End time filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              To (End Time)
            </label>
            <input
              type="datetime-local"
              className="filter-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button className="refresh-btn" onClick={applyFilters}>
              🔍 Apply Filters
            </button>
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ Clear
            </button>
          </div>
        </div>
      </div>
      
      
      {/* ---- DATA TABLE ---- */}
      {loading ? (
        <div className="loading-text">⏳ Loading sensor readings...</div>
      ) : error ? (
        <div className="error-text">❌ {error}</div>
      ) : readings.length === 0 ? (
        <div className="card">
          <p className="empty-text">No sensor readings found for the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Device / Topic</th>
                  <th>🌡️ Temp (°C)</th>
                  <th>💧 Humidity (%)</th>
                  <th>⚡ Voltage (V)</th>
                  <th>🔌 Current (A)</th>
                  <th>🌬️ Pressure (hPa)</th>
                  <th>Received At</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td style={{ color: '#aaa', fontSize: '12px' }}>#{reading.id}</td>
                    <td>
                      {/* Show topic in a styled pill */}
                      <span style={{
                        background: '#f0f4ff',
                        color: '#4f8cff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        wordBreak: 'break-all'
                      }}>
                        {reading.topic}
                      </span>
                    </td>
                    <td>{formatValue(reading.temperature)}</td>
                    <td>{formatValue(reading.humidity)}</td>
                    <td>{formatValue(reading.voltage)}</td>
                    <td>{formatValue(reading.current)}</td>
                    <td>{formatValue(reading.pressure)}</td>
                    <td style={{ color: '#666', fontSize: '13px' }}>
                      {formatTime(reading.received_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          
          {/* ---- PAGINATION ---- */}
          {pagination && pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
              >
                ⟪ First
              </button>
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage <= 1}
              >
                ← Prev
              </button>
              
              <span className="page-info">
                Page <strong>{currentPage}</strong> of <strong>{pagination.total_pages}</strong>
                &nbsp;({pagination.total_count.toLocaleString()} records)
              </span>
              
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= pagination.total_pages}
              >
                Next →
              </button>
              <button
                onClick={() => setCurrentPage(pagination.total_pages)}
                disabled={currentPage >= pagination.total_pages}
              >
                Last ⟫
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RawDataPage;
