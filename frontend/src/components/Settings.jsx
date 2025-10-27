import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api';
import './Settings.css';

const Settings = () => {
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');

  // Load app settings
  const loadAppSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      console.log('Settings API Response:', response);
      if (response.data.length > 0) {
        const settings = response.data[0];
        console.log('Loaded settings:', settings);
        setAppSettings(settings);
        setTheme(settings.theme || 'light');
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

  useEffect(() => {
    loadAppSettings();
  }, []);

  // Save Firebase configuration
  const saveFirebaseConfig = async () => {
    if (!appSettings) {
      setMessage('App settings not loaded');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Validate JSON if not empty
      if (firebaseConfig.trim()) {
        JSON.parse(firebaseConfig);
      }

      console.log('Sending settings update:', {
        ...appSettings,
        firebase_config: firebaseConfig
      });

      const response = await settingsAPI.update(appSettings.id, {
        ...appSettings,
        firebase_config: firebaseConfig
      });

      console.log('Settings update response:', response);
      setAppSettings(response.data);
      setMessage('Settings saved successfully!');
      
      // Dispatch a custom event to notify other components about the settings update
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: response.data }));
      
      // Also update the parent window's settings if needed
      window.parent.dispatchEvent(new CustomEvent('settingsUpdated', { detail: response.data }));
    } catch (error) {
      console.error('Failed to save Firebase config:', error);
      if (error instanceof SyntaxError) {
        setMessage('Invalid JSON format. Please check your Firebase configuration.');
      } else {
        setMessage('Failed to save settings: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save theme setting
  const saveThemeSetting = async (newTheme) => {
    try {
      let updatedSettings;
      if (appSettings) {
        // Update existing settings
        const response = await settingsAPI.update(appSettings.id, { 
          ...appSettings,
          theme: newTheme 
        });
        updatedSettings = response.data;
      } else {
        // Create new settings
        const response = await settingsAPI.create({ theme: newTheme, firebase_config: firebaseConfig });
        updatedSettings = response.data;
      }
      setAppSettings(updatedSettings);
      setTheme(newTheme);
      setMessage('Theme updated successfully!');
      
      // Dispatch a custom event to notify other components about the settings update
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: updatedSettings }));
      window.parent.dispatchEvent(new CustomEvent('settingsUpdated', { detail: updatedSettings }));
    } catch (error) {
      console.error('Failed to save theme setting:', error);
      setMessage('Failed to update theme: ' + error.message);
    }
  };

  return (
    <div className="data-section">
      <h2>⚙️ Settings</h2>
      
      {/* Theme Settings */}
      <div className="data-action-card">
        <h3>🎨 Theme Settings</h3>
        <div className="theme-options">
          <button 
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => saveThemeSetting('light')}
          >
            ☀️ Light
          </button>
          <button 
            className={`theme-option ${theme === 'dim' ? 'active' : ''}`}
            onClick={() => saveThemeSetting('dim')}
          >
            🌗 Dim
          </button>
          <button 
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => saveThemeSetting('dark')}
          >
            🌙 Dark
          </button>
        </div>
      </div>
      
      {/* Firebase Configuration */}
      <div className="data-action-card">
        <h3>🔥 Firebase Configuration</h3>
        <p>Configure Firebase connection to access external form data.</p>
        
        <div className="firebase-config-section">
          <label>Firebase Config JSON:</label>
          <textarea
            value={firebaseConfig}
            onChange={(e) => setFirebaseConfig(e.target.value)}
            placeholder='{
  "apiKey": "your-api-key",
  "authDomain": "your-auth-domain",
  "projectId": "your-project-id",
  ...
}'
            rows={10}
            className="firebase-config-textarea"
            disabled={loading}
          />
          
          <button 
            onClick={saveFirebaseConfig}
            className="export-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;