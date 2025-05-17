import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Card } from '../common/Card';

interface Stat {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  color: string;
}

interface StatisticsWidgetProps {
  className?: string;
}

export function StatisticsWidget({ className = '' }: StatisticsWidgetProps) {
  const [stats, setStats] = useState<Stat[]>([
    {
      id: '1',
      label: 'Documents',
      value: 24,
      previousValue: 18,
      unit: '',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      label: 'Passwords',
      value: 42,
      previousValue: 35,
      unit: '',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      label: 'Completion',
      value: 68,
      previousValue: 52,
      unit: '%',
      color: 'bg-green-500'
    },
    {
      id: '4',
      label: 'Security Score',
      value: 85,
      previousValue: 75,
      unit: '%',
      color: 'bg-amber-500'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'bar' | 'pie'>('bar');
  
  const refreshStats = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update with random fluctuations
      setStats(stats.map(stat => ({
        ...stat,
        previousValue: stat.value,
        value: Math.max(0, stat.value + Math.floor(Math.random() * 10) - 3)
      })));
      setIsLoading(false);
    }, 800);
  };
  
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {activeView === 'bar' 
              ? <BarChart size={18} className="text-blue-500" />
              : <PieChart size={18} className="text-blue-500" />
            }
            System Metrics
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setActiveView('bar')}
              className={`p-1 rounded-full ${
                activeView === 'bar' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Bar view"
            >
              <BarChart size={16} />
            </button>
            <button 
              onClick={() => setActiveView('pie')}
              className={`p-1 rounded-full ${
                activeView === 'pie' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Pie view"
            >
              <PieChart size={16} />
            </button>
            <button 
              onClick={refreshStats}
              disabled={isLoading}
              className={`p-1 rounded-full ${
                isLoading 
                  ? 'text-gray-400 animate-spin' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Refresh stats"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        {activeView === 'bar' ? (
          <div className="space-y-4">
            {stats.map(stat => {
              const percentChange = getPercentChange(stat.value, stat.previousValue);
              const isPositive = stat.value >= stat.previousValue;
              
              return (
                <div key={stat.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{stat.value}{stat.unit}</span>
                      {stat.value !== stat.previousValue && (
                        <span className={`text-xs flex items-center ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {percentChange}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`${stat.color} h-2 rounded-full`}
                      style={{ width: `${stat.unit === '%' ? stat.value : (stat.value / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="3"></circle>
                
                {stats.map((stat, index) => {
                  const value = stat.unit === '%' ? stat.value / 100 : stat.value / 100;
                  const previousStrokeOffset = stats
                    .slice(0, index)
                    .reduce((acc, s) => {
                      return acc + (s.unit === '%' ? s.value / 100 : s.value / 100);
                    }, 0) * 100;
                  
                  return (
                    <circle 
                      key={stat.id}
                      cx="21" 
                      cy="21" 
                      r="15.91549430918954" 
                      fill="transparent" 
                      stroke={stat.color.replace('bg-', 'var(--')} 
                      strokeWidth="3"
                      strokeDasharray={`${value * 100} ${100 - (value * 100)}`}
                      strokeDashoffset={-previousStrokeOffset}
                      className="transition-all duration-500"
                    ></circle>
                  );
                })}
                
                <circle cx="21" cy="21" r="12" fill="white"></circle>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold">{stats[2].value}%</span>
                <span className="text-xs text-gray-500">Completion</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 w-full">
              <div className="flex justify-center gap-4">
                {stats.map(stat => (
                  <div key={stat.id} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="text-xs text-gray-600">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}