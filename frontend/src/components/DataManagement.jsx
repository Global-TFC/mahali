import React, { useState, useEffect } from 'react'
import { settingsAPI } from '../api';
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
    <div className="data-section">
      <div className="section-header">
        <h2>💾 Data Management</h2>
      </div>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
        <button 
          className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import Data
        </button>
        <button 
          className={`tab-btn ${activeTab === 'firebase' ? 'active' : ''}`}
          onClick={() => setActiveTab('firebase')}
        >
          Member Requests
        </button>
      </div>
      
      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="data-action-card">
          <h3>📤 Export Data</h3>
          <p>Export all data to a ZIP file for backup or transfer.</p>
          <button 
            onClick={exportData} 
            className="export-btn"
            disabled={disabled}
          >
            {disabled ? 'Processing...' : 'Export Now'}
          </button>
          
          {/* Export Progress */}
          {exportProgress && (
            <div className={`progress-container ${exportProgress.status}`}>
              {exportProgress.status === 'completed' ? (
                renderSuccessEffect(false)
              ) : (
                <>
                  <div className="progress-header">
                    <span>{exportProgress.message}</span>
                    {exportProgress.progress && <span>{exportProgress.progress}%</span>}
                  </div>
                  {exportProgress.progress && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${exportProgress.progress}%`}}
                      ></div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="data-action-card">
          <h3>📥 Import Data</h3>
          <p>Import data from a previously exported ZIP file.</p>
          <label className={`import-btn ${disabled ? 'disabled' : ''}`}>
            {disabled ? 'Processing...' : 'Select File'}
            <input 
              type="file" 
              accept=".zip" 
              onChange={importData} 
              disabled={disabled}
            />
          </label>
          
          {/* Import Progress */}
          {importProgress && (
            <div className={`progress-container ${importProgress.status}`}>
              {importProgress.status === 'completed' ? (
                renderSuccessEffect(true)
              ) : (
                <>
                  <div className="progress-header">
                    <span>{importProgress.message}</span>
                    {importProgress.progress && <span>{importProgress.progress}%</span>}
                  </div>
                  {importProgress.progress && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${importProgress.progress}%`}}
                      ></div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Firebase Tab */}
      {activeTab === 'firebase' && (
        <FirebaseDataImproved />
      )}
      
      {/* Firebase Configuration Section */}
      {activeTab === 'firebase' && (
        <div className="data-action-card firebase-config-section">
          <h3>🔥 Firebase Configuration</h3>
          <p>Configure Firebase to enable member request processing.</p>
          <textarea
            value={firebaseConfig}
            onChange={(e) => setFirebaseConfig(e.target.value)}
            placeholder='Enter Firebase configuration as JSON (e.g., {"apiKey": "...", "authDomain": "...", "projectId": "..."})'
            className="firebase-config-textarea"
          />
          <button 
            onClick={saveFirebaseConfig} 
            className="save-btn"
            disabled={loading || disabled}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          {message && (
            <div className={`message ${message.includes('Error') || message.includes('Invalid') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataManagement