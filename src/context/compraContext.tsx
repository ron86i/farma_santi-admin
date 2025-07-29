import React, { createContext, useContext, useState } from "react";

// Tipo de datos que manejará el contexto
type ComprasContextType = {
    compraAction: boolean;
    setCompraAction: (value: boolean) => void;
};

// Crear el contexto
const ComprasContext = createContext<ComprasContextType | undefined>(undefined);

// Provider
type ComprasProviderProps = {
    children: React.ReactNode;
};

export function ComprasProvider({ children }: ComprasProviderProps) {
    const [compraAction, setCompraAction] = useState(false);

    return (
        <ComprasContext.Provider value={{ compraAction, setCompraAction }}>
            {children}
        </ComprasContext.Provider>
    );
}

// Hook personalizado para usar el contexto
export function useComprasContext() {
    const context = useContext(ComprasContext);
    if (!context) {
        throw new Error("useComprasContext debe usarse dentro de <ComprasProvider>");
    }
    return context;
}
