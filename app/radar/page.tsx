'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';

interface TrendItem {
  tag: string;
  count: number;
  velocity: number;
}

interface TrendData {
  generated_at: string;
  surface: TrendItem[];
  deep: TrendItem[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Velocity Indicator Component
 */
const VelocityIndicator = ({ value }: { value: number }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const colorClass = isPositive ? 'text-velocity-up' : isNeutral ? 'text-velocity-neutral' : 'text-velocity-down';
  
  return (
    <div className={`flex items-center ${colorClass}`}>
      <span className="text-sm font-medium">
        {isPositive ? '+' : ''}{value.toLocaleString()}
      </span>
      {!isNeutral && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isPositive ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      )}
    </div>
  );
};

/**
 * Trend Card Component
 */
const TrendCard = ({ trend }: { trend: TrendItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold truncate">{trend.tag}</h3>
        <div className="flex items-center space-x-3">
          <span className="text-gray-600 font-medium">{trend.count.toLocaleString()}</span>
          <VelocityIndicator value={trend.velocity} />
        </div>
      </div>
    </div>
  );
};

/**
 * Trend Grid Component
 */
const TrendGrid = ({ title, subtitle, trends }: { title: string; subtitle: string; trends: TrendItem[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
          <span className="text-sm font-normal text-gray-500 ml-2">{subtitle}</span>
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {trends.length > 0 ? (
            trends.map((trend, index) => (
              <TrendCard key={`${trend.tag}-${index}`} trend={trend} />
            ))
          ) : (
            <p className="text-gray-500">No trends available</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Radar Dashboard Component
 */
export default function RadarPage() {
  const { data, error, isLoading, mutate } = useSWR<TrendData>('/api/trends', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
  });
  
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Process trends to ensure uniqueness
  const processedData = useMemo(() => {
    if (!data) return null;
    
    // Create a map to track unique tags
    const uniqueTags = new Map<string, boolean>();
    
    // Filter surface trends to ensure uniqueness
    const uniqueSurface = data.surface.filter(trend => {
      if (uniqueTags.has(trend.tag)) return false;
      uniqueTags.set(trend.tag, true);
      return true;
    });
    
    // Filter deep trends to ensure uniqueness
    const uniqueDeep = data.deep.filter(trend => {
      if (uniqueTags.has(trend.tag)) return false;
      uniqueTags.set(trend.tag, true);
      return true;
    });
    
    return {
      ...data,
      surface: uniqueSurface,
      deep: uniqueDeep
    };
  }, [data]);
  
  useEffect(() => {
    if (data?.generated_at) {
      const date = new Date(data.generated_at);
      setLastUpdated(date.toLocaleString());
    }
  }, [data]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CoreframeAI Hashtag Radar</h1>
              <p className="text-gray-600 mt-2">
                Tracking real-time hashtag trends and builder activity
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {lastUpdated && (
                <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
              )}
              <button 
                onClick={() => mutate()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Now
              </button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Auto-refreshing:</span> Data updates every minute. Last crawl: {lastUpdated || 'Loading...'}
            </p>
          </div>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p>We couldn't retrieve the latest trend data. Please try again later.</p>
            <button 
              onClick={() => mutate()} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        ) : processedData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendGrid 
              title="Top Surface Waves" 
              subtitle="Mass adoption trends" 
              trends={processedData.surface} 
            />
            
            <TrendGrid 
              title="Top Builder Currents" 
              subtitle="Deep tech trends" 
              trends={processedData.deep} 
            />
          </div>
        ) : null}
        
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Data refreshed every 2 hours via Google Trends and Trends24</p>
          <p className="mt-1">© {new Date().getFullYear()} CoreframeAI</p>
        </footer>
      </div>
    </div>
  );
}
