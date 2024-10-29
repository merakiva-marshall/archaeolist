// src/components/SearchDialog.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent } from './ui/dialog'
import { Search, Loader2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SearchResult {
  id: string
  name: string
  country: string
  country_slug: string
  slug: string
}

export default function SearchDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const searchSites = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, country, country_slug, slug')
          .ilike('name', `%${query}%`)
          .limit(10)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchSites, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    router.push(`/sites/${result.country_slug}/${result.slug}`)
    onClose()
    setQuery('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="relative">
          <div className="flex items-center border-b">
            <Search className="h-5 w-5 text-gray-400 ml-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sites..."
              className="w-full p-4 pl-3 text-gray-900 placeholder-gray-400 focus:outline-none"
              autoComplete="off"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="h-5 w-5 text-gray-400 mr-4 animate-spin" />
            )}
          </div>

          {results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {result.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {result.country}
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && !isLoading && results.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">
              No sites found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}