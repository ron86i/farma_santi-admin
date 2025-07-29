// context/UsuariosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type PrincipiosActivosContextType = {
    principioActivoAction: boolean;
    setPrincipioActivoAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const PrincipiosActivosContext = createContext<PrincipiosActivosContextType | undefined>(undefined);

// Provider
type PrincipiosActivosProviderProps = {
    children: React.ReactNode;
};

export function PrincipiosActivosProvider({ children }: PrincipiosActivosProviderProps) {
    const [principioActivoAction, setPrincipioActivoAction] = useState(false);
    return (
        <PrincipiosActivosContext.Provider value={{ principioActivoAction, setPrincipioActivoAction }}>
            {children}
        </PrincipiosActivosContext.Provider>
    );
}

// Hook para usar fácilmente el contexto
export function usePrincipiosActivosContext() {
    const context = useContext(PrincipiosActivosContext);
    if (!context) throw new Error("usePrincipiosActivosContext debe usarse dentro de <PrincipiosActivosProvider>");
    return context;
}
