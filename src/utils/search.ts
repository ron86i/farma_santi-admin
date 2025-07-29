//Función para acceder a propiedades anidadas (ej: "persona.ci")
export function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }