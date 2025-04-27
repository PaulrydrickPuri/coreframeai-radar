'use client';

import { useEffect, useState } from 'react';
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
 * Trend Card Component
 */
const TrendCard = ({ trend }: { trend: TrendItem }) => {
  const isPositive = trend.velocity > 0;
  const isNeutral = trend.velocity === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold truncate">{trend.tag}</h3>
        <div className="flex items-center space-x-1">
          <span className="text-gray-600 font-medium">{trend.count.toLocaleString()}</span>
          <div className={`flex items-center ml-2 ${isPositive ? 'text-velocity-up' : isNeutral ? 'text-velocity-neutral' : 'text-velocity-down'}`}>
            {isPositive ? (
              <>
                <span className="text-sm">+{trend.velocity}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : isNeutral ? (
              <span className="text-sm">0</span>
            ) : (
              <>
                <span className="text-sm">{trend.velocity}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </div>
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
  
  useEffect(() => {
    if (data?.generated_at) {
      const date = new Date(data.generated_at);
      setLastUpdated(date.toLocaleString());
    }
  }, [data]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CoreframeAI Hashtag Radar</h1>
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-600">
            Tracking real-time hashtag trends and builder activity
          </p>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
            )}
            <button 
              onClick={() => mutate()} 
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>Error loading trend data. Please try again later.</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Surface Trends Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Top-10 Surface Waves
              <span className="text-sm font-normal text-gray-500 ml-2">Mass adoption trends</span>
            </h2>
            <div className="space-y-3">
              {data.surface.length > 0 ? (
                data.surface.map((trend, index) => (
                  <TrendCard key={`surface-${index}`} trend={trend} />
                ))
              ) : (
                <p className="text-gray-500">No surface trends available</p>
              )}
            </div>
          </div>
          
          {/* Deep Trends Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Top-10 Builder Currents
              <span className="text-sm font-normal text-gray-500 ml-2">Deep tech trends</span>
            </h2>
            <div className="space-y-3">
              {data.deep.length > 0 ? (
                data.deep.map((trend, index) => (
                  <TrendCard key={`deep-${index}`} trend={trend} />
                ))
              ) : (
                <p className="text-gray-500">No deep trends available</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
