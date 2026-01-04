import React, { useState, useEffect } from 'react'
import { settingsAPI } from '../api';
import { FaDatabase, FaFire } from 'react-icons/fa';
import FirebaseDataImproved from './FirebaseDataImproved';

const DataManagement = ({ exportData, importData, exportProgress, importProgress, disabled }) => {
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('export'); // 'export', 'import', or 'firebase'

  // Function to render success effect
  const renderSuccessEffect = (isImport = false) => (
    <div className="success-effect">
      <div className="success-icon">✓</div>
      <div className="success-message">{isImport ? 'Import Successful!' : 'Export Successful!'}</div>
    </div>
  );

  // Load app settings
  const loadAppSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      if (response.data.length > 0) {
        const settings = response.data[0];
        setAppSettings(settings);
        if (settings.firebase_config) {
          setFirebaseConfig(settings.firebase_config);
        }
      } else {
        // Create default settings
        const response = await settingsAPI.create({ theme: 'light', firebase_config: '' });
        setAppSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load app settings:', error);
    }
  };

  // Save Firebase configuration
  const saveFirebaseConfig = async () => {
    if (!appSettings) {
      setMessage('App settings not loaded');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Validate JSON
      if (firebaseConfig.trim()) {
        JSON.parse(firebaseConfig);
      }

      const response = await settingsAPI.update(appSettings.id, {
        ...appSettings,
        firebase_config: firebaseConfig
      });

      setAppSettings(response.data);
      setMessage('Firebase configuration saved successfully!');

      // Dispatch event to notify other components of settings update
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: response.data }));
    } catch (error) {
      console.error('Failed to save Firebase config:', error);
      if (error instanceof SyntaxError) {
        setMessage('Invalid JSON format. Please check your Firebase configuration.');
      } else {
        setMessage('Failed to save Firebase configuration: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount
  React.useEffect(() => {
    loadAppSettings();
  }, []);

  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <h2>
          <div className="header-icon-wrapper">
            <FaDatabase />
          </div>
          Data Core
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ marginBottom: '32px', display: 'flex', gap: '8px', padding: '4px', background: 'var(--header-bg)', borderRadius: '12px', width: 'fit-content' }}>
        <button
          className={`btn-secondary ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
          style={{ border: 'none', background: activeTab === 'export' ? 'var(--primary)' : 'transparent', color: activeTab === 'export' ? 'white' : 'var(--text-muted)' }}
        >
          Archive (Export)
        </button>
        <button
          className={`btn-secondary ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
          style={{ border: 'none', background: activeTab === 'import' ? 'var(--primary)' : 'transparent', color: activeTab === 'import' ? 'white' : 'var(--text-muted)' }}
        >
          Restore (Import)
        </button>
        <button
          className={`btn-secondary ${activeTab === 'firebase' ? 'active' : ''}`}
          onClick={() => setActiveTab('firebase')}
          style={{ border: 'none', background: activeTab === 'firebase' ? 'var(--primary)' : 'transparent', color: activeTab === 'firebase' ? 'white' : 'var(--text-muted)' }}
        >
          Cloud Sync
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="data-action-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="header-icon-wrapper" style={{ margin: '0 auto 24px', width: '64px', height: '64px', fontSize: '2rem' }}>
            <FaDatabase />
          </div>
          <h3 className="font-semibold" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Backup System State</h3>
          <p className="text-muted" style={{ marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>Create a secure, compressed archive of all your regional data, financial vaults, and member directories.</p>
          <button
            onClick={exportData}
            className="btn-primary"
            style={{ padding: '12px 48px' }}
            disabled={disabled}
          >
            {disabled ? 'Processing...' : 'Generate Archive'}
          </button>

          {/* Export Progress */}
          {exportProgress && (
            <div className={`status-banner ${exportProgress.status === 'completed' ? 'success' : ''}`} style={{ marginTop: '32px', maxWidth: '500px', margin: '32px auto 0' }}>
              {exportProgress.status === 'completed' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <span>✅</span>
                  <span>System backup successfully exported.</span>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{exportProgress.message}</span>
                    <span>{exportProgress.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', background: 'var(--header-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${exportProgress.progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="data-action-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="header-icon-wrapper" style={{ margin: '0 auto 24px', width: '64px', height: '64px', fontSize: '2rem', background: 'var(--accent-gradient)' }}>
            <FaDatabase style={{ transform: 'rotate(180deg)' }} />
          </div>
          <h3 className="font-semibold" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Restore System State</h3>
          <p className="text-muted" style={{ marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>Upload a previously generated archive to restore the application state. <strong style={{ color: 'var(--error)' }}>Warning: This will overwrite current data.</strong></p>

          <label className={`btn-primary ${disabled ? 'disabled' : ''}`} style={{ display: 'inline-block', padding: '12px 48px', cursor: 'pointer' }}>
            {disabled ? 'Restoring...' : 'Select & Restore Archive'}
            <input
              type="file"
              accept=".zip"
              onChange={importData}
              disabled={disabled}
              style={{ display: 'none' }}
            />
          </label>

          {/* Import Progress */}
          {importProgress && (
            <div className={`status-banner ${importProgress.status === 'completed' ? 'success' : ''}`} style={{ marginTop: '32px', maxWidth: '500px', margin: '32px auto 0' }}>
              {importProgress.status === 'completed' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <span>✅</span>
                  <span>System state restored successfully.</span>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{importProgress.message}</span>
                    <span>{importProgress.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', background: 'var(--header-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${importProgress.progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Firebase Tab */}
      {activeTab === 'firebase' && (
        <div className="animate-in">
          <FirebaseDataImproved />

          <div className="data-action-card" style={{ marginTop: '32px', padding: '32px' }}>
            <h3 className="font-semibold" style={{ marginBottom: '16px' }}>
              <FaFire style={{ color: '#ff4b2b', marginRight: '8px' }} />
              Cloud Bridge Status
            </h3>
            <div className="form-group">
              <label className="text-muted" style={{ fontSize: '0.9rem' }}>Configuration Payload</label>
              <div className="input-wrapper" style={{ marginTop: '8px' }}>
                <textarea
                  value={firebaseConfig}
                  onChange={(e) => setFirebaseConfig(e.target.value)}
                  placeholder='Enter Firebase configuration as JSON'
                  className="search-input"
                  style={{ fontFamily: 'monospace', height: '120px' }}
                />
              </div>
              <button
                onClick={saveFirebaseConfig}
                className="btn-secondary"
                style={{ marginTop: '16px' }}
                disabled={loading || disabled}
              >
                {loading ? 'Validating...' : 'Update Configuration'}
              </button>
              {message && (
                <div className={`status-banner ${message.includes('Error') || message.includes('Invalid') ? 'error' : 'success'}`} style={{ marginTop: '16px' }}>
                  <p>{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataManagement