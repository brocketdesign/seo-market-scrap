'use client';

import { useSession } from '@/lib/auth/mock-auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

interface CronJobSummary {
  total: number;
  active: number;
  scheduled: number;
  failed: number;
  upcomingJobs?: Array<CronJob>;
  recentJobs?: Array<CronJob>;
}

interface CronJob {
  _id: string;
  name: string;
  schedule: string;
  query: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  status?: string;
}

interface Product {
  _id: string;
  title: string;
  source: string;
  images?: string[];
  scrapedAt: string;
}

interface ProductSummary {
  total: number;
  amazon: number;
  rakuten: number;
  other: number;
  recentlyAdded: number;
  recentProducts?: Array<Product>;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cronJobStats, setCronJobStats] = useState<CronJobSummary>({
    total: 0,
    active: 0,
    scheduled: 0,
    failed: 0
  });
  const [productStats, setProductStats] = useState<ProductSummary>({
    total: 0,
    amazon: 0,
    rakuten: 0,
    other: 0,
    recentlyAdded: 0
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiBaseUrl = `localhost:${process.env.PORT}` || 'http://localhost:8000';
      console.log('apiBaseUrl:', apiBaseUrl, 'process.env.PORT:', process.env.PORT);
      const response = await fetch(`${apiBaseUrl}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      // Update stats with real data
      if (data.cronJobs) {
        setCronJobStats(data.cronJobs);
      }
      
      if (data.products) {
        setProductStats(data.products);
      }
      
      console.log('Dashboard data loaded:', data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format stats for display with icons
  const stats: DashboardStat[] = [
    {
      label: 'Total Products',
      value: productStats.total,
      change: '+12% from last month',
      isPositive: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      label: 'Amazon Products',
      value: productStats.amazon,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
    },
    {
      label: 'Rakuten Products',
      value: productStats.rakuten,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Active Cron Jobs',
      value: cronJobStats.active,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      name: 'Scrape Products',
      description: 'Search and scrape products from Amazon or Rakuten',
      href: '/admin/scraper',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'bg-indigo-500',
    },
    {
      name: 'Manage Cron Jobs',
      description: 'Configure automated scraping schedules',
      href: '/admin/cron-jobs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
    {
      name: 'View Products',
      description: 'Browse and manage scraped products',
      href: '/admin/products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: 'bg-emerald-500',
    },
    {
      name: 'Settings',
      description: 'Configure system and user settings',
      href: '/admin/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      ),
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {session?.user?.name || 'Admin'}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">{stat.label}</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.change && (
                  <div className={`mt-1 text-xs ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${index % 4 === 0 ? 'bg-indigo-100 text-indigo-600' : 
                                                 index % 4 === 1 ? 'bg-blue-100 text-blue-600' : 
                                                 index % 4 === 2 ? 'bg-red-100 text-red-600' : 
                                                 'bg-purple-100 text-purple-600'}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {quickActions.map((action, index) => (
          <Link 
            key={index} 
            href={action.href}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className={`${action.color} h-2`}></div>
            <div className="p-6">
              <div className={`rounded-full w-14 h-14 flex items-center justify-center mb-4 ${action.color} bg-opacity-10 text-opacity-80 text-gray-800`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{action.name}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 animate-pulse rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="p-6 text-center text-red-500">Failed to load products</div>
            ) : productStats.recentProducts && productStats.recentProducts.length > 0 ? (
              <>
                {productStats.recentProducts.map((product: Product) => {
                  // Calculate how long ago the product was added
                  const scrapedDate = new Date(product.scrapedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - scrapedDate.getTime());
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  
                  let timeAgo = 'today';
                  if (diffDays === 1) timeAgo = 'yesterday';
                  else if (diffDays > 1) timeAgo = `${diffDays} days ago`;
                  
                  // Determine icon background color based on source
                  const bgColor = product.source === 'amazon' ? 'bg-blue-100' : 'bg-red-100';
                  const textColor = product.source === 'amazon' ? 'text-blue-500' : 'text-red-500';
                  
                  return (
                    <div key={product._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded ${bgColor} flex items-center justify-center ${textColor}`}>
                          {product.images && product.images[0] ? (
                            <div className="relative h-full w-full overflow-hidden rounded">
                              {/* Using a safer approach to handle image loading */}
                              {(() => {
                                // Use proxy by default for Amazon images to avoid CORS issues
                                const useProxy = product.source === 'amazon' || 
                                  product.images[0].includes('amazon.com') ||
                                  product.images[0].includes('ssl-images-amazon');
                                
                                const imageSrc = useProxy 
                                  ? `/api/images?url=${encodeURIComponent(product.images[0])}`
                                  : product.images[0];
                                  
                                return (
                                  <Image 
                                    src={imageSrc} 
                                    alt={product.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      // If image still fails with proxy, try another image or fallback
                                      const img = e.target as HTMLImageElement;
                                      // Try the next image if available
                                      if (product.images && product.images.length > 1) {
                                        img.src = `/api/images?url=${encodeURIComponent(product.images[1])}`;
                                      }
                                    }}
                                  />
                                );
                              })()}
                            </div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-xs text-gray-500">
                            {product.source.charAt(0).toUpperCase() + product.source.slice(1)} • Added {timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">No products found</div>
            )}
          </div>
        </div>
        
        {/* Recent Cron Jobs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Scheduled Jobs</h2>
            <Link href="/admin/cron-jobs" className="text-sm text-indigo-600 hover:text-indigo-800">Manage</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 animate-pulse rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="p-6 text-center text-red-500">Failed to load scheduled jobs</div>
            ) : cronJobStats.upcomingJobs && cronJobStats.upcomingJobs.length > 0 ? (
              <>
                {cronJobStats.upcomingJobs.map((job: CronJob) => {
                  // Determine icon and status based on job status
                  const isActive = job.isActive;
                  const bgColor = isActive ? 'bg-green-100' : 'bg-gray-100';
                  const textColor = isActive ? 'text-green-500' : 'text-gray-400';
                  const statusText = isActive ? 'Active' : 'Paused';
                  const statusColor = isActive ? 'text-green-600' : 'text-gray-500';
                  
                  // Format the schedule text
                  let scheduleText = job.schedule;
                  if (scheduleText.includes('* * * * *')) {
                    scheduleText = 'Runs every minute';
                  } else if (scheduleText.includes('0 0 * * *')) {
                    scheduleText = 'Runs daily at midnight';
                  } else if (scheduleText.includes('0 0 * * 0')) {
                    scheduleText = 'Runs every Sunday';
                  } else if (scheduleText.includes('0 0 1 * *')) {
                    scheduleText = 'Runs on 1st of every month';
                  }
                  
                  return (
                    <div key={job._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                          {isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div className="text-sm font-medium text-gray-900">{job.name}</div>
                            <div className={`text-xs font-medium ${statusColor}`}>{statusText}</div>
                          </div>
                          <div className="text-xs text-gray-500">{scheduleText}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">No scheduled jobs found</div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
    </div>
  );
}
