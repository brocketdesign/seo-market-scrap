import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ScraperSettings {
  userAgent: string;
  requestTimeout: number;
  waitTime: number;
  useProxy: boolean;
  proxyList: string[];
}

export interface DashboardSettings {
  itemsPerPage: number;
  defaultSorting: string;
  defaultSortDirection: string;
}

export interface NotificationSettings {
  enableEmailNotifications: boolean;
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
  emailRecipients: string[];
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maxConcurrentJobs: number;
  dataRetentionDays: number;
}

export interface Settings {
  _id?: string;
  scraperSettings: ScraperSettings;
  dashboardSettings: DashboardSettings;
  notificationSettings: NotificationSettings;
  systemSettings: SystemSettings;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Fetch all settings
 */
export const getSettings = async (): Promise<Settings> => {
  const response = await fetchWithAuth(`${API_URL}/settings`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch settings');
  }
  
  return response.json();
};

/**
 * Update scraper settings
 */
export const updateScraperSettings = async (settings: Partial<ScraperSettings>): Promise<Settings> => {
  const response = await fetchWithAuth(`${API_URL}/settings/scraper`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update scraper settings');
  }
  
  return response.json();
};

/**
 * Update dashboard settings
 */
export const updateDashboardSettings = async (settings: Partial<DashboardSettings>): Promise<Settings> => {
  const response = await fetchWithAuth(`${API_URL}/settings/dashboard`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update dashboard settings');
  }
  
  return response.json();
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<Settings> => {
  const response = await fetchWithAuth(`${API_URL}/settings/notifications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update notification settings');
  }
  
  return response.json();
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<Settings> => {
  const response = await fetchWithAuth(`${API_URL}/settings/system`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update system settings');
  }
  
  return response.json();
};

/**
 * Trigger manual cleanup of old data
 */
export const triggerCleanup = async (): Promise<{ message: string; deletedCount: number }> => {
  const response = await fetchWithAuth(`${API_URL}/settings/cleanup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to trigger cleanup');
  }
  
  return response.json();
};
