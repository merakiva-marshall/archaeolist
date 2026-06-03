// src/hooks/useSiteFilters.ts
'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MapFilters } from '../types/site'

type FilterKey = 'countries' | 'periods' | 'features'

/**
 * Reads the shared filter state from the URL query params and writes it back.
 * The same param keys (`countries`, `periods`, `features`, `unesco`) drive both
 * the All Sites page grid and the interactive map, so filters stay in sync and
 * are shareable via the URL.
 */
export function useSiteFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: MapFilters = useMemo(() => {
    const parse = (key: string) =>
      searchParams.get(key)?.split(',').map((v) => v.trim()).filter(Boolean) ?? []
    return {
      countries: parse('countries'),
      periods: parse('periods'),
      features: parse('features'),
      unesco: searchParams.get('unesco') === 'true',
    }
  }, [searchParams])

  const apply = useCallback((next: MapFilters) => {
    const params = new URLSearchParams(searchParams.toString())
    // Filter changes always reset pagination on the All Sites page.
    params.delete('page')

    const setList = (key: FilterKey, values: string[]) => {
      if (values.length > 0) params.set(key, values.join(','))
      else params.delete(key)
    }
    setList('countries', next.countries)
    setList('periods', next.periods)
    setList('features', next.features)
    if (next.unesco) params.set('unesco', 'true')
    else params.delete('unesco')

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  const toggleInList = useCallback((key: FilterKey, value: string) => {
    const current = filters[key]
    const nextList = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    apply({ ...filters, [key]: nextList })
  }, [filters, apply])

  const setUnesco = useCallback((value: boolean) => {
    apply({ ...filters, unesco: value })
  }, [filters, apply])

  const removeValue = useCallback((key: FilterKey, value: string) => {
    apply({ ...filters, [key]: filters[key].filter((v) => v !== value) })
  }, [filters, apply])

  const clearAll = useCallback(() => {
    apply({ countries: [], periods: [], features: [], unesco: false })
  }, [apply])

  const activeCount =
    filters.countries.length +
    filters.periods.length +
    filters.features.length +
    (filters.unesco ? 1 : 0)

  return {
    filters,
    apply,
    toggleInList,
    setUnesco,
    removeValue,
    clearAll,
    activeCount,
  }
}
