// src/components/Header.tsx

import { Menu, Search } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16"> {/* Increased height for more space */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="mt-8">
                  <ul className="space-y-4">
                    <li><a href="/" className="hover:text-blue-600">Home</a></li>
                    <li><a href="/about" className="hover:text-blue-600">About</a></li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
            
            <a href="/" className="ml-6 flex items-center space-x-2"> {/* Increased left margin */}
              <span className="text-2xl font-bold text-blue-600 font-days-one tracking-wide">Archaeolist</span>
              {/* Increased to text-2xl, added tracking-wide for slight letter spacing */}
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}