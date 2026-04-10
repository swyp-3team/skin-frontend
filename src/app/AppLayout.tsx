import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="min-h-dvh bg-[#d9d9d9] text-slate-900">
      <Outlet />
    </div>
  )
}

export default AppLayout
