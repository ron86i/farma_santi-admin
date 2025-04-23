// MainLayout.tsx
import { useAutoRefreshToken } from "@/hooks"
import { LayoutSidebar, Navbar } from "./components"
import { Outlet } from "react-router"

// import { SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"

export function MainLayout() {
  useAutoRefreshToken("exp-access-token")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      {sidebarOpen && <LayoutSidebar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
      <div className="flex flex-col flex-1 w-full">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
