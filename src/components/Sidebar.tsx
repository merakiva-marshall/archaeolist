import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface Site {
  id: string;
  name: string;
  description: string;
  address: string;
  period: string[] | string | null;
  features: string[] | string | null;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, site }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{site?.name || 'Site Information'}</SheetTitle>
          {site && (
            <SheetDescription>
              <p>{site.description}</p>
              <p><strong>Address:</strong> {site.address}</p>
              <p><strong>Period:</strong> {Array.isArray(site.period) ? site.period.join(', ') : site.period}</p>
              <p><strong>Features:</strong> {Array.isArray(site.features) ? site.features.join(', ') : site.features}</p>
            </SheetDescription>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar