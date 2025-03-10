import React from 'react';

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}

const DashboardCard = ({
  icon: Icon,
  title,
  description,
  className = ""
}: DashboardCardProps) => {
  return (
    <div className={`bg-[#B5D3D3] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-start mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default DashboardCard;