// src/components/SitePlaceholder.tsx

interface SitePlaceholderProps {
    name?: string;
  }
  
  export default function SitePlaceholder({ name }: SitePlaceholderProps) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Background */}
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            className="text-gray-200"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />
  
          {/* Main Temple Silhouette */}
          <g className="text-gray-300">
            {/* Base Platform */}
            <rect x="20" y="70" width="60" height="5" fill="currentColor" />
            
            {/* Steps */}
            <path d="M25 70 L75 70 L70 65 L30 65 Z" fill="currentColor" />
            
            {/* Columns */}
            <rect x="30" y="35" width="5" height="30" fill="currentColor" />
            <rect x="65" y="35" width="5" height="30" fill="currentColor" />
            <rect x="40" y="40" width="3" height="25" fill="currentColor" />
            <rect x="57" y="40" width="3" height="25" fill="currentColor" />
            
            {/* Pediment */}
            <path d="M25 35 L75 35 L50 20 Z" fill="currentColor" opacity="0.7" />
            
            {/* Column Bases */}
            <rect x="28" y="65" width="9" height="2" fill="currentColor" />
            <rect x="38" y="65" width="7" height="2" fill="currentColor" />
            <rect x="55" y="65" width="7" height="2" fill="currentColor" />
            <rect x="63" y="65" width="9" height="2" fill="currentColor" />
          </g>
        </svg>
  
        {/* Text Container with Larger Text */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-100 to-transparent py-6">
          <div className="text-center px-6">
            {name ? (
              <div className="text-base md:text-lg font-semibold text-gray-600 line-clamp-2">
                {name}
              </div>
            ) : (
              <div className="text-base md:text-lg font-medium text-gray-500">
                Archaeological Site
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }