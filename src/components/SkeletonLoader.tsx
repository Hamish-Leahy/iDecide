import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}