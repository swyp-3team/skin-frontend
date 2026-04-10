import type { FullResult, PreviewResult } from '../../api/types'

export function isFullResult(result: PreviewResult | FullResult): result is FullResult {
  return 'recommendedProducts' in result && 'routine' in result
}
