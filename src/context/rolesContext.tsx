// context/UsuariosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type RolesContextType = {
  rolAction: boolean;
  setRolAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const RolesContext = createContext<RolesContextType | undefined>(undefined);

// Provider
type RolesProviderProps = {
  children: React.ReactNode;
};

export function RolesProvider({ children }: RolesProviderProps) {
  const [rolAction, setRolAction] = useState(false);
  return (
    <RolesContext.Provider value={{ rolAction, setRolAction }}>
      {children}
    </RolesContext.Provider>
  );
}

// Hook para usar fácilmente el contexto
export function useRolesContext() {
  const context = useContext(RolesContext);
  if (!context) throw new Error("useRolesContext debe usarse dentro de <RolesProvider>");
  return context;
}
