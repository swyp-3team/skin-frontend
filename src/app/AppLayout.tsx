import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { cn } from '../lib/utils'
import { APP_ROUTES } from './routes'

const THEME_COLOR_META_ID = 'app-theme-color'
const DEFAULT_THEME_COLOR = '#FFFFFF'
const SURVEY_THEME_COLOR = '#CCEEED'

const normalizePathname = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '' ? APP_ROUTES.home : normalized
}

function AppLayout() {
  const { pathname } = useLocation()
  const normalizedPathname = normalizePathname(pathname)
  const isSurveyRoute = normalizedPathname === APP_ROUTES.survey
  const themeColor = isSurveyRoute ? SURVEY_THEME_COLOR : DEFAULT_THEME_COLOR

  useEffect(() => {
    const themeColorMeta =
      document.querySelector<HTMLMetaElement>(`meta#${THEME_COLOR_META_ID}[name="theme-color"]`) ??
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

    if (!themeColorMeta) {
      return
    }

    themeColorMeta.setAttribute('content', themeColor)
    document.documentElement.style.backgroundColor = themeColor
    document.body.style.backgroundColor = themeColor
  }, [themeColor])

  return (
    <div
      className={cn(
        'min-h-[100dvh] text-slate-900',
        isSurveyRoute ? 'bg-[#CCEEED]' : 'bg-white',
      )}
    >
      <Outlet />
    </div>
  )
}

export default AppLayout
