import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Button } from './ui/button'
import { Site } from '../types/site' 

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onLearnMore: (site: Site) => void;
}

export default function Sidebar({ isOpen, onClose, site, onLearnMore }: SidebarProps) {
  if (!site) return null;

  const formatList = (list: string[] | string | null): string => {
    if (Array.isArray(list)) {
      return list.join(', ');
    } else if (typeof list === 'string') {
      return list;
    }
    return 'N/A';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{site.name}</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <p className="mb-2">{site.description}</p>
          <p className="mb-2"><strong>Address:</strong> {site.address}</p>
          <p className="mb-2"><strong>Period:</strong> {formatList(site.period)}</p>
          <p className="mb-2"><strong>Features:</strong> {formatList(site.features)}</p>
          <Button onClick={() => onLearnMore(site)}>Learn More</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}