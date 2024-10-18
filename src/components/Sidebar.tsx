// src/components/Sidebar.tsx

import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { Site } from '../types/site'
import { Card, CardContent } from './ui/card'
import { X } from 'lucide-react'


type SidebarFieldValue = string | string[] | [number, number] | null;

type SidebarFieldConfig = {
  title: string;
  render: (value: SidebarFieldValue) => React.ReactNode;
};

const parseJsonString = (value: SidebarFieldValue): string[] => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return Array.isArray(value) ? value.map(String) : [];
};

const formatList = (list: SidebarFieldValue): JSX.Element => {
  const parsedList = parseJsonString(list);
  if (parsedList.length > 0) {
    return (
      <ul className="list-disc list-inside">
        {parsedList.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-gray-700">N/A</p>;
};

const sidebarFields: Record<keyof Pick<Site, 'description' | 'period' | 'features'>, SidebarFieldConfig> = {
  description: {
    title: "Description",
    render: (value) => <p className="text-gray-700">{value as string}</p>
  },
  period: {
    title: "Period",
    render: (value) => formatList(value)
  },
  features: {
    title: "Features",
    render: (value) => formatList(value)
  }
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onLearnMore: (site: Site) => void;
  onOpen: () => void;
}

export default function Sidebar({ isOpen, onClose, site, onLearnMore, onOpen }: SidebarProps) {
  useEffect(() => {
    if (isOpen && site) {
      onOpen();
    }
  }, [isOpen, site, onOpen]);

  if (!site) return null;

  const renderSection = (title: string, content: React.ReactNode) => (
    <div key={title} className="mb-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {content}
    </div>
  );

  return (
    <div 
      className={`fixed bg-white shadow-lg 
                  transition-transform duration-300 ease-in-out z-40
                  ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}
                  sm:w-[400px] sm:top-[5rem] sm:bottom-[5rem] sm:right-4
                  sm:rounded-l-2xl sm:rounded-tr-2xl sm:rounded-br-2xl
                  max-sm:w-[calc(100%-1rem)] max-sm:top-[33%] max-sm:bottom-16 max-sm:left-2 max-sm:right-[-0.5rem]
                  max-sm:rounded-2xl`}
    >
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 pr-8">{site.name}</h2>
        <Card className="mb-4 flex-grow overflow-y-auto">
          <CardContent className="pt-6">
            {(Object.entries(sidebarFields) as [keyof Site, SidebarFieldConfig][]).map(([key, field]) => 
              renderSection(field.title, field.render(site[key]))
            )}
          </CardContent>
        </Card>
        <Button 
          onClick={() => onLearnMore(site)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}