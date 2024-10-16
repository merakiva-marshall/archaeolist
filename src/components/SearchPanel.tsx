// src/app/components/SearchPanel.tsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Site } from '../types/site';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResults: (results: Site[]) => void;
}

export default function SearchPanel({ isOpen, onClose, onSearchResults }: SearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    period: '',
    country: '',
  });

  const handleSearch = async () => {
    let query = supabase
      .from('sites')
      .select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters.period) {
      query = query.contains('period', [filters.period]);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error performing search:', error);
      return;
    }

    onSearchResults(data as Site[]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Archaeological Sites</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name or description"
          className="w-full p-2 border rounded mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mb-4">
          <label className="block mb-2">Period:</label>
          <input
            type="text"
            placeholder="e.g., Neolithic, Bronze Age"
            className="w-full p-2 border rounded"
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Country:</label>
          <input
            type="text"
            placeholder="e.g., Egypt, Greece"
            className="w-full p-2 border rounded"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}