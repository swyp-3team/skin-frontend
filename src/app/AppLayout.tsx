import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-white text-neutral-800">
      <Outlet />
    </div>
  )
}

export default AppLayout
