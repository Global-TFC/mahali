import React, { useState, useEffect } from 'react';
import { 
  FaHome, 
  FaMapMarkerAlt, 
  FaHouseUser, 
  FaUsers, 
  FaFolder, 
  FaDatabase, 
  FaSun, 
  FaMoon, 
  FaAdjust 
} from 'react-icons/fa';
import { settingsAPI } from '../api';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  areasCount, 
  housesCount, 
  membersCount, 
  collectionsCount,
  disabled
}) => {
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      if (response.data.length > 0) {
        const settings = response.data[0];
        setAppSettings(settings);
        setTheme(settings.theme); // This should update the parent component's state
      } else {
        // If no settings exist, create default settings
        const response = await settingsAPI.create({ theme: 'light' });
        setAppSettings(response.data);
        setTheme('light');
      }
    } catch (error) {
      console.error('Failed to load app settings:', error);
      // Set default theme if loading fails
      setTheme('light');
    }
  };

  const saveThemeSetting = async (newTheme) => {
    try {
      let updatedSettings;
      if (appSettings) {
        // Update existing settings
        const response = await settingsAPI.update(appSettings.id, { theme: newTheme });
        updatedSettings = response.data;
      } else {
        // Create new settings
        const response = await settingsAPI.create({ theme: newTheme });
        updatedSettings = response.data;
      }
      setAppSettings(updatedSettings);
      setTheme(newTheme); // Update parent component's state
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

  const handleThemeChange = (newTheme) => {
    saveThemeSetting(newTheme);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/logo.png" alt="Mahali Logo" className="logo-icon" />
          <h2>Mahali</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
          disabled={disabled}
        >
          <FaHome className="tab-icon" />
          <span>Dashboard</span>
        </button>
        <button 
          className={activeTab === 'areas' ? 'active' : ''}
          onClick={() => setActiveTab('areas')}
          disabled={disabled}
        >
          <FaMapMarkerAlt className="tab-icon" />
          <span>Areas</span>
        </button>
        <button 
          className={activeTab === 'houses' ? 'active' : ''}
          onClick={() => setActiveTab('houses')}
          disabled={disabled}
        >
          <FaHouseUser className="tab-icon" />
          <span>Houses</span>
        </button>
        <button 
          className={activeTab === 'members' ? 'active' : ''}
          onClick={() => setActiveTab('members')}
          disabled={disabled}
        >
          <FaUsers className="tab-icon" />
          <span>Members</span>
        </button>
        <button 
          className={activeTab === 'collections' ? 'active' : ''}
          onClick={() => setActiveTab('collections')}
          disabled={disabled}
        >
          <FaFolder className="tab-icon" />
          <span>Collections</span>
        </button>
        <button 
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
          disabled={disabled}
        >
          <FaDatabase className="tab-icon" />
          <span>Data Management</span>
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <div className="theme-selector">
          <button 
            className={theme === 'light' ? 'active' : ''}
            onClick={() => handleThemeChange('light')}
            title="Light Theme"
            disabled={disabled}
          >
            <FaSun className="theme-icon" />
          </button>
          <button 
            className={theme === 'dim' ? 'active' : ''}
            onClick={() => handleThemeChange('dim')}
            title="Dim Theme"
            disabled={disabled}
          >
            <FaAdjust className="theme-icon" />
          </button>
          <button 
            className={theme === 'dark' ? 'active' : ''}
            onClick={() => handleThemeChange('dark')}
            title="Dark Theme"
            disabled={disabled}
          >
            <FaMoon className="theme-icon" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;