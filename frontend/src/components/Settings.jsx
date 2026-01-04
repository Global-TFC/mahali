import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api';
import { FaCog } from 'react-icons/fa';
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
    <div className="data-section animate-in">
      <div className="section-header">
        <h2>
          <div className="header-icon-wrapper">
            <FaCog />
          </div>
          System Control
        </h2>
      </div>

      {/* Theme Settings */}
      <div className="data-action-card" style={{ padding: '32px' }}>
        <h3 className="font-semibold" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
          Visual Appearance
        </h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Choose the theme that best fits your environment.</p>
        <div className="theme-options" style={{ display: 'flex', gap: '16px' }}>
          <button
            className={`btn-secondary ${theme === 'light' ? 'active-theme' : ''}`}
            onClick={() => saveThemeSetting('light')}
            style={{ flex: 1, padding: '16px', borderRadius: '16px', background: theme === 'light' ? 'var(--primary)' : '', color: theme === 'light' ? 'white' : '' }}
          >
            ☀️ Bright Daylight
          </button>
          <button
            className={`btn-secondary ${theme === 'dim' ? 'active-theme' : ''}`}
            onClick={() => saveThemeSetting('dim')}
            style={{ flex: 1, padding: '16px', borderRadius: '16px', background: theme === 'dim' ? 'var(--primary)' : '', color: theme === 'dim' ? 'white' : '' }}
          >
            🌗 Midnight Dim
          </button>
          <button
            className={`btn-secondary ${theme === 'dark' ? 'active-theme' : ''}`}
            onClick={() => saveThemeSetting('dark')}
            style={{ flex: 1, padding: '16px', borderRadius: '16px', background: theme === 'dark' ? 'var(--primary)' : '', color: theme === 'dark' ? 'white' : '' }}
          >
            🌙 Deep Abyss
          </button>
        </div>
      </div>

      {/* Firebase Configuration */}
      <div className="data-action-card" style={{ padding: '32px', marginTop: '32px' }}>
        <h3 className="font-semibold" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
          Network Integration
        </h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Bridge the application with external cloud services via Firebase.</p>

        <div className="form-group">
          <label style={{ marginBottom: '12px', display: 'block' }}>Firebase Configuration Payload (JSON)</label>
          <div className="input-wrapper">
            <textarea
              value={firebaseConfig}
              onChange={(e) => setFirebaseConfig(e.target.value)}
              placeholder='{ "apiKey": "...", "projectId": "..." }'
              rows={8}
              className="search-input"
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
              disabled={loading}
            />
          </div>

          <button
            onClick={saveFirebaseConfig}
            className="btn-primary"
            style={{ marginTop: '24px' }}
            disabled={loading}
          >
            {loading ? 'Securing...' : 'Verify & Synchronize'}
          </button>

          {message && (
            <div className={`status-banner ${message.includes('success') ? 'success' : 'error'}`} style={{ marginTop: '24px' }}>
              <div className="status-icon">{message.includes('success') ? '✅' : '⚠️'}</div>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;