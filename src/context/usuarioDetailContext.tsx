import React, { createContext, useState, useContext } from "react";
import { UsuarioDetail } from "@/models";

type UsuarioContextType = {
  usuario: UsuarioDetail | null;
  clearUsuario: () => void;  // método para limpiar
  setUsuario: React.Dispatch<React.SetStateAction<UsuarioDetail | null>>; // función para actualizar usuario
};

export const UsuarioDetailContext = createContext<UsuarioContextType | undefined>(undefined);

type UsuarioProviderProps = {
  children: React.ReactNode;
};

export function UsuarioDetailProvider({ children }: UsuarioProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioDetail | null>(null);

  const clearUsuario = () => setUsuario(null);

  return (
    <UsuarioDetailContext.Provider value={{ usuario, clearUsuario, setUsuario }}>
      {children}
    </UsuarioDetailContext.Provider>
  );
}

export function useUsuarioDetailContext() {
  const context = useContext(UsuarioDetailContext);
  if (!context) throw new Error("useUsuarioContext debe usarse dentro de <UsuarioProvider>");
  return context;
}
