import React, { useState } from 'react';
import { Utensils, Plus, Search, Filter } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { SearchInput } from '../common/SearchInput';

export function DietNutrition() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diet & Nutrition</h1>
          <p className="text-gray-600 mt-1">
            Manage your pets' dietary needs and nutrition plans
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {}}
          icon={<Plus size={20} />}
        >
          Add Diet Plan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search diet plans..."
          className="flex-1"
        />
        <Button
          variant="outline"
          icon={<Filter size={20} />}
        >
          Filters
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Utensils size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">No Diet Plans Yet</h3>
              <p className="text-sm text-gray-500">Add your first diet plan to get started</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {}}
          >
            Add Diet Plan
          </Button>
        </Card>
      </div>
    </div>
  );
}