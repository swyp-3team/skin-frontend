export interface ResultHeaderViewModel {
  diagnosisTitle: string
  subtitle: string
  summary: string
  diagnosedAt: string
  subSummary: string
}

export type RoutineTabId = 'am' | 'pm'

export type ResultProductTabId =
  | 'ALL'
  | 'SKIN_TONER'
  | 'ESSENCE_SERUM_AMPOULE'
  | 'LOTION_EMULSION'
  | 'CREAM'
  | 'SUNCARE'

export interface ResultProductTabItem {
  id: ResultProductTabId
  label: string
}
