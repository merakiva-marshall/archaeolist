// src/components/Sidebar.tsx

import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Button } from './ui/button'
import { Site } from '../types/site'
import { Card, CardContent } from './ui/card'

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

// Configuration object for sidebar fields
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
}

export default function Sidebar({ isOpen, onClose, site, onLearnMore }: SidebarProps) {
  if (!site) return null;

  const renderSection = (title: string, content: React.ReactNode) => (
    <div key={title} className="mb-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {content}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md md:max-w-lg bg-opacity-50 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold mb-4">{site.name}</SheetTitle>
        </SheetHeader>
        <Card className="mb-4">
          <CardContent className="pt-6">
            {(Object.entries(sidebarFields) as [keyof Site, SidebarFieldConfig][]).map(([key, field]) => 
              renderSection(field.title, field.render(site[key]))
            )}
          </CardContent>
        </Card>
        <Button 
          onClick={() => onLearnMore(site)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Learn More
        </Button>
      </SheetContent>
    </Sheet>
  )
}