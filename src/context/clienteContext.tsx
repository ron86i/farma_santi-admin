import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type ClientesContextType = {
  clienteAction: boolean;
  setClienteAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

// Provider
type ClientesProviderProps = {
  children: React.ReactNode;
};

export function ClientesProvider({ children }: ClientesProviderProps) {
  const [clienteAction, setClienteAction] = useState(false);

  return (
    <ClientesContext.Provider value={{ clienteAction, setClienteAction }}>
      {children}
    </ClientesContext.Provider>
  );
}

// Hook para usar fácilmente el contexto
export function useClientesContext() {
  const context = useContext(ClientesContext);
  if (!context) throw new Error("useClientesContext debe usarse dentro de <ClientesProvider>");
  return context;
}
