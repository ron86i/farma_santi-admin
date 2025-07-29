// context/UsuariosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type ProveedorContextType = {
    proveedorAction: boolean;
    setProveedorAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const ProveedoresContext = createContext<ProveedorContextType | undefined>(undefined);

// Provider
type ProveedoresProviderProps = {
    children: React.ReactNode;
};

export function ProveedoresProvider({ children }: ProveedoresProviderProps) {
    const [proveedorAction, setProveedorAction] = useState(false);
    return (
        <ProveedoresContext.Provider value={{ proveedorAction, setProveedorAction }}>
            {children}
        </ProveedoresContext.Provider>
    );
}

// Hook para usar fácilmente el contexto
export function useProveedoresContext() {
    const context = useContext(ProveedoresContext);
    if (!context) throw new Error("useProveedoresContext debe usarse dentro de <ProveedoresProvider>");
    return context;
}
