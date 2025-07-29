import React, { createContext, useState, useContext } from "react";

// Tipo de datos que compartirá el contexto
type ProductosContextType = {
  productoAction: boolean;
  setProductoAction: (value: boolean) => void;
};

// Creamos el contexto con valor por defecto
const ProductosContext = createContext<ProductosContextType | undefined>(undefined);

// Provider
type ProductosProviderProps = {
  children: React.ReactNode;
};

export function ProductosProvider({ children }: ProductosProviderProps) {
  const [productoAction, setProductoAction] = useState(false);

  return (
    <ProductosContext.Provider value={{ productoAction, setProductoAction }}>
      {children}
    </ProductosContext.Provider>
  );
}

// Hook personalizado para acceder al contexto fácilmente
export function useProductosContext() {
  const context = useContext(ProductosContext);
  if (!context) throw new Error("useProductosContext debe usarse dentro de <ProductosProvider>");
  return context;
}
