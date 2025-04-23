// Navbar.tsx
import { Menu } from "lucide-react"
import { ModeToggle } from "@/components"

interface NavbarProps {
  toggleSidebar: () => void
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <header className=" bg-neutral-50 dark:bg-neutral-900 px-6 py-3 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-neutral-800 dark:text-neutral-100 cursor-pointer "
          >
            <Menu className="size-6" />
          </button>
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">
            Panel de Administración
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            admin
          </span>

          {/* Placeholder para avatar o dropdown */}
          <div className="w-8 h-8 rounded-full bg-emerald-400 dark:bg-emerald-600 flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
