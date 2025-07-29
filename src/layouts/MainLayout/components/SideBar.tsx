import { Menu } from "lucide-react";
import { ButtonLink } from "@/components";
import { Separator } from "@/components/ui";
import { NavSection, getSections } from "../constants/sidebar";
import logoFarmacia from "@/assets/Logo2.png";
type LayoutSidebarProps = {
  toggleSidebar: () => void;
  role: string[];
  clearUsuario: () => void;
};

export function LayoutSidebar({ toggleSidebar, role, clearUsuario}: LayoutSidebarProps) {
  // Mapa para combinar todas las secciones según los roles, evitando duplicados
  const combinedSectionsMap = new Map<string, NavSection>();

  role.forEach((rol) => {
    const sectionsForRole = getSections(clearUsuario).get(rol);
    if (!sectionsForRole) return;

    sectionsForRole.forEach((section) => {
      const label = section.label ?? "";

      if (!combinedSectionsMap.has(label)) {
        // Agrega una copia si no existe aún
        combinedSectionsMap.set(label, {
          ...section,
          items: [...section.items],
        });
      } else {
        // Si ya existe, combina evitando duplicados por ruta
        const existingSection = combinedSectionsMap.get(label)!;
        section.items.forEach((item) => {
          if (!existingSection.items.some((i) => i.to === item.to)) {
            existingSection.items.push(item);
          }
        });
      }
    });
  });

  const combinedSections = Array.from(combinedSectionsMap.entries());

  return (
    <aside className="h-screen overflow-auto max-md:absolute max-md:z-50 w-64 bg-neutral-50 dark:bg-neutral-900 px-6 py-4 border-r border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-baseline gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden max-md:block text-neutral-800 dark:text-neutral-100 cursor-pointer"
        >
          <Menu className="size-6" />
        </button>
        <h2 className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
          <img  src={logoFarmacia} />
        </h2>
      </div>

      <nav className="flex flex-col gap-4">
        {combinedSections.map(([labelKey, section], idx) => (
          <div key={labelKey} className="px-4">
            {section.label && (
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {section.label}
              </h4>
            )}
            {section.items.map((item) => (
              <ButtonLink
                key={item.to}
                to={item.to}
                title={item.title}
                nameIcon={item.icon}
                onClick={item.onClick}
                className={item.className}
              />
            ))}
            {idx < combinedSections.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
