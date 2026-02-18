export function NavBar() {
    return (
        <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 top-0 z-30">
            <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">

                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">
                        Movimientos
                    </h2>
                </div>
                
                {/* Aquí podrías poner un avatar de usuario o notificaciones en el futuro */}
                <div className="flex items-center gap-2">
                   {/* <UserNav /> */}
                </div>
            </div>
        </nav>
    )
}