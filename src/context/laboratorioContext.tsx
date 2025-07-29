// context/LaboratoriosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type LaboratoriosContextType = {
    laboratorioAction: boolean;
    setLaboratorioAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const LaboratoriosContext = createContext<LaboratoriosContextType | undefined>(undefined);

// Provider
type LaboratoriosProviderProps = {
    children: React.ReactNode;
};

export function LaboratoriosProvider({ children }: LaboratoriosProviderProps) {
    const [laboratorioAction, setLaboratorioAction] = useState(false);
    return (
        <LaboratoriosContext.Provider value={{ laboratorioAction, setLaboratorioAction }}>
            {children}
        </LaboratoriosContext.Provider>
    );
}

// Hook para usar fácilmente el contexto
export function useLaboratoriosContext() {
    const context = useContext(LaboratoriosContext);
    if (!context) throw new Error("useLaboratoriosContext debe usarse dentro de <LaboratoriosProvider>");
    return context;
}
