'use client';

import { useSession } from 'next-auth/react';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

interface CronJob {
  _id: string;
  name: string;
  keyword?: string;
  url?: string;
  type: 'keyword' | 'url' | 'sitemap';
  source: 'Amazon' | 'Rakuten' | 'Generic';
  schedule: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export default function CronJobsPage() {
  const { data: session } = useSession();
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state for creating new job
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    type: 'keyword',
    keyword: '',
    url: '',
    source: 'Amazon',
    schedule: '0 0 * * *', // Default: daily at midnight
    isActive: true
  });
  
  // Fetch cron jobs on load
  useEffect(() => {
    if (session?.accessToken) {
      fetchCronJobs();
    }
  }, [session]);
  
  const fetchCronJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/cron-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch cron jobs');
      }
      
      const data = await response.json();
      setCronJobs(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching cron jobs');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateJob = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validation
      if (!newJob.name) {
        throw new Error('Job name is required');
      }
      
      if (newJob.type === 'keyword' && !newJob.keyword) {
        throw new Error('Keyword is required for keyword-type jobs');
      }
      
      if (newJob.type === 'url' && !newJob.url) {
        throw new Error('URL is required for URL-type jobs');
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/cron-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(newJob),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create cron job');
      }
      
      const data = await response.json();
      setCronJobs([...cronJobs, data]);
      setSuccess(`Cron job "${data.name}" created successfully!`);
      setShowNewJobForm(false);
      
      // Reset form
      setNewJob({
        name: '',
        type: 'keyword',
        keyword: '',
        url: '',
        source: 'Amazon',
        schedule: '0 0 * * *',
        isActive: true
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the cron job');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleJobStatus = async (job: CronJob) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/cron-jobs/${job._id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to toggle job status`);
      }
      
      const updatedJob = await response.json();
      setCronJobs(cronJobs.map(j => j._id === updatedJob._id ? updatedJob : j));
      setSuccess(`Job "${updatedJob.name}" ${updatedJob.isActive ? 'activated' : 'paused'} successfully`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while toggling job status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/cron-jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete cron job');
      }
      
      setCronJobs(cronJobs.filter(job => job._id !== jobId));
      setSuccess('Cron job deleted successfully');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the cron job');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatScheduleDescription = (cronExpression: string) => {
    // Basic translations for common cron patterns
    switch (cronExpression) {
      case '0 0 * * *':
        return 'Daily at midnight';
      case '0 12 * * *':
        return 'Daily at noon';
      case '0 0 * * 0':
        return 'Weekly on Sunday';
      case '0 0 1 * *':
        return 'Monthly (1st day)';
      case '0 0 1 1 *':
        return 'Yearly (Jan 1)';
      case '0 * * * *':
        return 'Every hour';
      default:
        return cronExpression;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cron Job Management</h1>
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
      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Success:</strong> {success}</span>
        </div>
      )}
      
      {/* Create New Job Button/Form */}
      {!showNewJobForm ? (
        <div className="mb-6">
          <button
            onClick={() => setShowNewJobForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Scheduled Job
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New Scheduled Scraping Job
            </h2>
            <button
              onClick={() => setShowNewJobForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Name
                </label>
                <input 
                  type="text" 
                  id="jobName" 
                  value={newJob.name}
                  onChange={(e) => setNewJob({...newJob, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Daily Amazon Laptops Scrape"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select 
                  id="jobType" 
                  value={newJob.type}
                  onChange={(e) => setNewJob({...newJob, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="keyword">Keyword Search</option>
                  <option value="url">Specific URL</option>
                  <option value="sitemap">Site Map (Advanced)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="jobSource" className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select 
                  id="jobSource" 
                  value={newJob.source}
                  onChange={(e) => setNewJob({...newJob, source: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Rakuten">Rakuten</option>
                  <option value="Generic">Other (Generic)</option>
                </select>
              </div>
              
              {/* Conditional fields based on job type */}
              {newJob.type === 'keyword' && (
                <div className="col-span-2">
                  <label htmlFor="jobKeyword" className="block text-sm font-medium text-gray-700 mb-1">
                    Keyword
                  </label>
                  <input 
                    type="text" 
                    id="jobKeyword" 
                    value={newJob.keyword}
                    onChange={(e) => setNewJob({...newJob, keyword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. laptop, smartphone, headphones"
                    required
                  />
                </div>
              )}
              
              {newJob.type === 'url' && (
                <div className="col-span-2">
                  <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input 
                    type="url" 
                    id="jobUrl" 
                    value={newJob.url}
                    onChange={(e) => setNewJob({...newJob, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://www.amazon.com/dp/..."
                    required
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="jobSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule (Cron Expression)
                </label>
                <select 
                  id="jobSchedule" 
                  value={newJob.schedule}
                  onChange={(e) => setNewJob({...newJob, schedule: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0 0 * * *">Daily at midnight</option>
                  <option value="0 12 * * *">Daily at noon</option>
                  <option value="0 0 * * 0">Weekly (Sunday)</option>
                  <option value="0 0 * * 1">Weekly (Monday)</option>
                  <option value="0 0 1 * *">Monthly (1st day)</option>
                  <option value="0 * * * *">Every hour</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  When should this job run automatically
                </p>
              </div>
              
              <div>
                <label htmlFor="jobActive" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="jobActive"
                    checked={newJob.isActive}
                    onChange={(e) => setNewJob({...newJob, isActive: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="jobActive" className="ml-2 block text-sm text-gray-700">
                    Active (will run at scheduled times)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewJobForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Job'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Cron Jobs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Scheduled Jobs
          </h2>
        </div>
        
        {isLoading && cronJobs.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-gray-500">Loading scheduled jobs...</p>
          </div>
        ) : cronJobs.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No scheduled jobs</h3>
            <p className="text-gray-500 mb-4">
              Create your first scheduled scraping job to automate data collection.
            </p>
            <button
              onClick={() => setShowNewJobForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source / Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cronJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{job.name}</div>
                      <div className="text-sm text-gray-500">{job.type} type</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                          job.source === 'Amazon' 
                            ? 'bg-blue-100 text-blue-800'
                            : job.source === 'Rakuten' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.source}
                        </span>
                        {job.type === 'keyword' ? job.keyword : job.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatScheduleDescription(job.schedule)}</div>
                      <div className="text-xs text-gray-500">{job.schedule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'running' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : job.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'disabled' || !job.isActive
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status === 'running' 
                          ? 'Running'
                          : job.isActive 
                            ? job.status.charAt(0).toUpperCase() + job.status.slice(1) 
                            : 'Paused'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.lastRunAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className={`p-1 rounded-md ${job.isActive ? 'text-indigo-600 hover:text-indigo-900' : 'text-green-600 hover:text-green-900'}`}
                          title={job.isActive ? 'Pause job' : 'Activate job'}
                        >
                          {job.isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        <Link 
                          href={`/admin/cron-jobs/${job._id}`}
                          className="p-1 rounded-md text-indigo-600 hover:text-indigo-900"
                          title="View job details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="p-1 rounded-md text-red-600 hover:text-red-900"
                          title="Delete job"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
