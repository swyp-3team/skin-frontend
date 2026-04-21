export interface ResultHeaderViewModel {
  diagnosisTitle: string
  summary: string
  tags: string[]
  diagnosedAt: string
}

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
