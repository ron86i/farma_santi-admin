// context/LaboratoriosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type loteProductosContextType = {
    loteProductoAction: boolean;
    setLoteProductoAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const LoteProductosContext = createContext<loteProductosContextType | undefined>(undefined);

// Provider
type LoteProductosProviderProps = {
    children: React.ReactNode;
};

export function LoteProductosProvider({ children }: LoteProductosProviderProps) {
    const [loteProductoAction, setLoteProductoAction] = useState(false);
    return (
        <LoteProductosContext.Provider value={{ loteProductoAction, setLoteProductoAction }}>
            {children}
        </LoteProductosContext.Provider>
    );
}

// Hook para usar fácilmente el contexto
export function useLoteProductosContext() {
    const context = useContext(LoteProductosContext);
    if (!context) throw new Error("useLoteProductosContext debe usarse dentro de <LoteProductosProvider>");
    return context;
}
