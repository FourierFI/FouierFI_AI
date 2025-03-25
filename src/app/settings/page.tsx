import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const { settings, updateSettings, isLoading, error } = useSettings();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">Please connect your wallet to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
              {/* Theme */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Theme</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      settings.theme === 'light'
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      settings.theme === 'dark'
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable notifications</span>
                  <button
                    onClick={() => updateSettings({ notifications: !settings.notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications ? 'bg-primary' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Trading View */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Trading View</h2>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show Trading View charts</span>
                  <button
                    onClick={() => updateSettings({ tradingView: !settings.tradingView })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.tradingView ? 'bg-primary' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.tradingView ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Auto Refresh */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Auto Refresh</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Enable auto refresh</span>
                    <button
                      onClick={() => updateSettings({ autoRefresh: !settings.autoRefresh })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.autoRefresh ? 'bg-primary' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {settings.autoRefresh && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.refreshInterval}
                        onChange={(e) =>
                          updateSettings({
                            refreshInterval: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 