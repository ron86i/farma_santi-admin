// context/UsuariosContext.tsx
import React, { createContext, useState, useContext } from "react";

// Tipo de datos que vas a compartir
type CategoriasContextType = {
    categoriaAction: boolean;
    setCategoriaAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
export const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

// Provider
type CategoriasProviderProps = {
    children: React.ReactNode;
};

export function CategoriasProvider({ children }: CategoriasProviderProps) {
    const [categoriaAction, setCategoriaAction] = useState(false);
    return (
        <CategoriasContext.Provider value={{ categoriaAction, setCategoriaAction }}>
            {children}
        </CategoriasContext.Provider>
    );
}

// Hook para usar fácilmente el contexto
export function useCategoriasContext() {
    const context = useContext(CategoriasContext);
    if (!context) throw new Error("useCategoriasContext debe usarse dentro de <CategoriasProvider>");
    return context;
}
