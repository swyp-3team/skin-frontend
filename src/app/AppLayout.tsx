import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-white text-slate-900">
      <Outlet />
    </div>
  )
}

export default AppLayout
