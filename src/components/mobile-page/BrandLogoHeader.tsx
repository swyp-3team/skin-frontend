import AppLogo from '@/components/icons/AppLogo'

const ROOT = 'sticky top-0 z-10 w-full h-12 px-5 py-2 grid grid-cols-[1fr_auto_1fr] items-center bg-common-0'

function BrandLogoHeader() {
  return (
    <header className={ROOT}>
      <div className="flex items-center">
        <AppLogo variant="muted" />
      </div>
    </header>
  )
}

export default BrandLogoHeader
