// src/components/Header.tsx

'use client'

import { useState } from 'react'
import { Menu, Search } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"
import SearchDialog from './SearchDialog'

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <nav className="mt-8">
                  <ul className="space-y-4 px-4">
                    <li><a href="/" className="hover:text-blue-600">Home</a></li>
                    <li><a href="/about" className="hover:text-blue-600">About</a></li>
                  </ul>
                </nav>
                <div className="mt-4 border-t border-gray-100 mb-4" />
                <nav>
                  <ul className="space-y-4 px-4">
                    <li><a href="/sites" className="hover:text-blue-600">All Sites</a></li>
                    <li><a href="/sites/unesco" className="hover:text-blue-600">UNESCO Sites</a></li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>

            <a href="/" className="ml-6 flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600 font-days-one tracking-wide">
                Archaeolist
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  )
}