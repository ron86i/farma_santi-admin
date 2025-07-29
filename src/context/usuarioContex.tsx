// context/UsuariosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type UsuariosContextType = {
  usuarioAction: boolean;
  setUsuarioAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const UsuariosContext = createContext<UsuariosContextType | undefined>(undefined);

// Provider
type UsuariosProviderProps = {
  children: React.ReactNode;
};

export function UsuariosProvider({ children }: UsuariosProviderProps) {
  const [usuarioAction, setUsuarioAction] = useState(false);

  return (
    <UsuariosContext.Provider value={{ usuarioAction, setUsuarioAction }}>
      {children}
    </UsuariosContext.Provider>
  );
}

// Hook para usar fácilmente el contexto
export function useUsuariosContext() {
  const context = useContext(UsuariosContext);
  if (!context) throw new Error("useUsuariosContext debe usarse dentro de <UsuariosProvider>");
  return context;
}
