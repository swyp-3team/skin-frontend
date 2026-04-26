import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { ProfileData, ResultDetail } from '../../api/types'
import type { ResultHeaderViewModel } from '../../components/results/types'
import { queryKeys } from '../../lib/queryKeys'
import { createResultHeaderViewModel } from './resultViewModel'

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

export function getResultDetailQueryOptions(resultId: number) {
  return queryOptions<ResultDetail, ApiError>({
    queryKey: queryKeys.result(resultId),
    queryFn: () => apiClient.getResult(resultId),
    enabled: isValidResultId(resultId),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useResultDetail(resultId: number) {
  return useQuery(getResultDetailQueryOptions(resultId))
}

export function useResultHeader(resultId: number) {
  return useQuery<ResultDetail, ApiError, ResultHeaderViewModel>({
    ...getResultDetailQueryOptions(resultId),
    select: createResultHeaderViewModel,
  })
}

function profileToHeaderViewModel(data: ProfileData): ResultHeaderViewModel {
  return {
    diagnosisTitle: data.skinType,
    subtitle: data.subtitle,
    summary: data.summary,
    diagnosedAt: data.diagnosedAt,
    subSummary: '',
  }
}

export function useProfileHeader() {
  return useQuery<ProfileData, ApiError, ResultHeaderViewModel>({
    queryKey: queryKeys.profile(),
    queryFn: () => apiClient.getProfile(),
    select: profileToHeaderViewModel,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
