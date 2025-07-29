// context/VentasContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que compartirás en el contexto
type VentasContextType = {
  ventaAction: boolean;
  setVentaAction: (value: boolean) => void;
};

// Crear contexto con valor inicial undefined
export const VentasContext = createContext<VentasContextType | undefined>(undefined);

// Provider para envolver la app o el módulo donde usarás el contexto
type VentasProviderProps = {
  children: React.ReactNode;
};

export function VentasProvider({ children }: VentasProviderProps) {
  const [ventaAction, setVentaAction] = useState(false);

  return (
    <VentasContext.Provider value={{ ventaAction, setVentaAction }}>
      {children}
    </VentasContext.Provider>
  );
}

// Hook personalizado para usar fácilmente el contexto
export function useVentasContext() {
  const context = useContext(VentasContext);
  if (!context) throw new Error("useVentasContext debe usarse dentro de <VentasProvider>");
  return context;
}
