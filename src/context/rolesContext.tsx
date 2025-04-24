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
type UsuarioProviderProps = {
  children: React.ReactNode;
};

export function RolesProvider({ children }: UsuarioProviderProps) {
  const [rolAction, setRolAction] = useState(false);
  return (
    <RolesContext.Provider value={{ rolAction: rolAction, setRolAction: setRolAction }}>
      {children}
    </RolesContext.Provider>
  );
}

// Hook para usar fácilmente el contexto
export function useRolesContext() {
  const context = useContext(RolesContext);
  if (!context) throw new Error("useUsuariosContext debe usarse dentro de <UsuarioProvider>");
  return context;
}
