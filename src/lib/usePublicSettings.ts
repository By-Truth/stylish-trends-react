import { useQuery } from '@tanstack/react-query'
import { settingsApi } from './api'
import type { Settings } from '../types'

export function usePublicSettings() {
  return useQuery<Settings>({
    queryKey: ['public-settings'],
    queryFn: settingsApi.getPublic,
    staleTime: Infinity,
  })
}
