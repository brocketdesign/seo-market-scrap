'use client';

import { useSession } from '@/lib/auth/mock-auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getSettings, 
  updateScraperSettings, 
  updateDashboardSettings,
  updateNotificationSettings,
  updateSystemSettings,
  triggerCleanup,
  Settings as SettingsType
} from '@/lib/api/settingsApi';

interface SettingsFormState {
  scrapingInterval: string;
  amazonApiKey: string;
  rakutenApiKey: string;
  emailNotifications: boolean;
  notificationEmail: string;
  userAgent: string;
  proxyEnabled: boolean;
  proxyUrl: string;
  maxConcurrentJobs: number;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState<SettingsFormState>({
    scrapingInterval: '300',
    amazonApiKey: '',
    rakutenApiKey: '',
    emailNotifications: false,
    notificationEmail: '',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    proxyEnabled: false,
    proxyUrl: '',
    maxConcurrentJobs: 2
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred while fetching settings' 
      });
      console.error('Settings fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? Number(value) 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Settings updated successfully' 
      });
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred while updating settings' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to trigger a cleanup? This will stop all running jobs and clear temporary data.')) {
      return;
    }
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/admin/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to trigger cleanup');
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Cleanup triggered successfully' 
      });
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred while triggering cleanup' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <Link 
          href="/admin/dashboard" 
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Messages */}
      {message.text && (
        <div className={`mb-6 p-4 text-sm ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
          } rounded-lg flex items-center`} 
          role="alert"
        >
          {message.type === 'error' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span><strong>{message.type === 'error' ? 'Error:' : 'Success:'}</strong> {message.text}</span>
        </div>
      )}
      
      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            System Settings
          </h2>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scraping Settings Section */}
              <div className="col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Scraping Configuration
                </h3>
              </div>
              
              <div>
                <label htmlFor="scrapingInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Scraping Interval (seconds)
                </label>
                <input 
                  type="number" 
                  id="scrapingInterval" 
                  name="scrapingInterval"
                  value={settings.scrapingInterval}
                  onChange={handleChange}
                  min="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum time between scraping requests to avoid rate limiting
                </p>
              </div>
              
              <div>
                <label htmlFor="maxConcurrentJobs" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Concurrent Jobs
                </label>
                <input 
                  type="number" 
                  id="maxConcurrentJobs" 
                  name="maxConcurrentJobs"
                  value={settings.maxConcurrentJobs}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of scraping jobs that can run simultaneously
                </p>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="userAgent" className="block text-sm font-medium text-gray-700 mb-1">
                  User Agent String
                </label>
                <input 
                  type="text" 
                  id="userAgent" 
                  name="userAgent"
                  value={settings.userAgent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Browser user agent to use for scraping requests
                </p>
              </div>
              
              {/* API Keys Section */}
              <div className="col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  API Keys (Optional)
                </h3>
              </div>
              
              <div>
                <label htmlFor="amazonApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Amazon API Key
                </label>
                <input 
                  type="password" 
                  id="amazonApiKey" 
                  name="amazonApiKey"
                  value={settings.amazonApiKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  For Amazon Product API (optional)
                </p>
              </div>
              
              <div>
                <label htmlFor="rakutenApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Rakuten API Key
                </label>
                <input 
                  type="password" 
                  id="rakutenApiKey" 
                  name="rakutenApiKey"
                  value={settings.rakutenApiKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  For Rakuten Product API (optional)
                </p>
              </div>
              
              {/* Proxy Settings */}
              <div className="col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Proxy Configuration
                </h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="proxyEnabled"
                    name="proxyEnabled"
                    checked={settings.proxyEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="proxyEnabled" className="ml-2 block text-sm text-gray-700">
                    Use proxy for scraping
                  </label>
                </div>
                
                {settings.proxyEnabled && (
                  <div>
                    <label htmlFor="proxyUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Proxy URL
                    </label>
                    <input 
                      type="text" 
                      id="proxyUrl" 
                      name="proxyUrl"
                      value={settings.proxyUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="http://username:password@proxy.example.com:8080"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Full proxy URL including protocol, username, password if required
                    </p>
                  </div>
                )}
              </div>
              
              {/* Email Notification Settings */}
              <div className="col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Notifications
                </h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications for job completions and failures
                  </label>
                </div>
                
                {settings.emailNotifications && (
                  <div>
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Email Address
                    </label>
                    <input 
                      type="email" 
                      id="notificationEmail" 
                      name="notificationEmail"
                      value={settings.notificationEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Cleanup Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Cleanup
          </h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Trigger a cleanup to stop all running jobs and clear temporary data. This action cannot be undone.
          </p>
          
          <button
            onClick={handleCleanup}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Triggering...
              </>
            ) : (
              'Trigger Cleanup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
