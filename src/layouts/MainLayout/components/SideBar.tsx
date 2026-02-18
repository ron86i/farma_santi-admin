import { X } from "lucide-react";
import { ButtonLink } from "@/components";
import { Separator } from "@/components/ui";
import { NavSection, getSections } from "../constants/sidebar";
import logoFarmacia from "@/assets/Logo2.png";
import { useState } from "react";

type LayoutSidebarProps = {
  role: string[];
  clearUsuario: () => void;
  isOpen?: boolean;
  toggleSidebar?: () => void;
};

// Ordena items para que /logout quede siempre al final
function reorderLogoutLast(items: NavSection["items"]) {
  items.sort((a, b) => {
    if (a.to === "/logout" && b.to === "/logout") return 0;
    if (a.to === "/logout") return 1;
    if (b.to === "/logout") return -1;
    return 0;
  });
}

// Combina secciones y evita duplicados
function combineSections(role: string[], clearUsuario: () => void): [string, NavSection][] {
  const combinedSectionsMap = new Map<string, NavSection>();

  role.forEach((rol) => {
    const sectionsForRole = getSections(clearUsuario).get(rol);
    if (!sectionsForRole) return;

    sectionsForRole.forEach((section) => {
      const label = section.label ?? "";

      if (!combinedSectionsMap.has(label)) {
        combinedSectionsMap.set(label, {
          ...section,
          items: [...section.items],
        });
      } else {
        const existingSection = combinedSectionsMap.get(label)!;
        section.items.forEach((item) => {
          if (!existingSection.items.some((i) => i.to === item.to)) {
            existingSection.items.push(item);
          }
        });
      }

      // Ordenar logout dentro de esta sección para cada iteración
      reorderLogoutLast(combinedSectionsMap.get(label)!.items);
    });
  });

  // Pasar a array y ordenar secciones para que "Sesión" quede al final
  const combinedSections = Array.from(combinedSectionsMap.entries()).sort(([labelA], [labelB]) => {
    if (labelA === "Sesión") return 1;
    if (labelB === "Sesión") return -1;
    return 0;
  });

  return combinedSections;
}

export function LayoutSidebar({ role, clearUsuario, isOpen: isOpenProp, toggleSidebar: toggleSidebarProp }: LayoutSidebarProps) {
  // Estado interno solo si no se pasa isOpen desde props
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  // Usar props si están disponibles, sino usar estado interno
  const isOpen = isOpenProp ?? isOpenInternal;
  const toggleSidebar = toggleSidebarProp ?? (() => setIsOpenInternal(!isOpenInternal));
  
  const combinedSections = combineSections(role, clearUsuario);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen overflow-auto z-50
          w-64 bg-neutral-50 dark:bg-neutral-900 
          px-6 py-4 border-r border-neutral-200 dark:border-neutral-700 shadow-lg
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
              <img src={logoFarmacia} className="w-full" alt="Logo Farmacia" />
            </h2>
          </div>
          
          {/* Botón de cerrar para móvil */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-4">
          {combinedSections.map(([labelKey, section], idx) => (
            <div key={labelKey} className="px-4">
              {section.label && (
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {section.label}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <ButtonLink
                    key={item.to}
                    to={item.to}
                    title={item.title}
                    nameIcon={item.icon}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                      // Cerrar sidebar en móvil al hacer clic en un link
                      if (window.innerWidth < 768) {
                        toggleSidebar();
                      }
                    }}
                    className={item.className}
                  />
                ))}
              </div>
              {idx < combinedSections.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}