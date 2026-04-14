export const queryKeys = {
  surveyPreview: () => ['survey', 'preview'] as const,
  result: (id: number) => ['result', id] as const,
} as const
